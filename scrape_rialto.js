const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://rialto.interticket.com';
const ENTRY_POINT = 'https://rialto.interticket.com/ticketsearch';

// Keyword-based categorization
const CATEGORY_KEYWORDS = {
    'Theatre': ['play', 'stage', 'drama', 'theatre', 'performance', 'tragedy', 'comedy', 'love', 'physical theater', 'actor', 'directing'],
    'Music': ['concert', 'music', 'live', 'piano', 'violin', 'orchestra', 'symphony', 'recital', 'band', 'song', 'singer', 'musical'],
    'Dance': ['dance', 'ballet', 'choreography', 'dancer'],
    'Cinema': ['film', 'movie', 'screening', 'documentary', 'director', 'cinema'],
    'Festival': ['festival']
};

function inferCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    // Check for explicit category matches first (prioritize specific ones if needed)
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }
    return 'Other';
}

async function scrapeEventDetails(programUrl) {
    try {
        const fullUrl = programUrl.startsWith('http') ? programUrl : `${BASE_URL}/${programUrl}`;
        // console.log(`Scraping: ${fullUrl}`);

        const response = await axios.get(fullUrl);
        const $ = cheerio.load(response.data);

        // --- Selectors based on inspection ---
        const title = $('div.programInfo > h1').text().trim();
        const dateStr = $('time.ticketTime').attr('datetime') || $('time.ticketTime').text().trim();
        const venue = $('a.place').first().text().trim().replace(/[\n\t]+/g, ' '); // Clean newlines
        const image = $('img.mainImg').attr('src'); // Can be relative or absolute? Looks absolute in samples.
        const description = $('.programDescription').text().trim();
        const price = $('.ticketBoxOne .price').first().text().trim();

        const category = inferCategory(title, description);

        return {
            title,
            date: dateStr,
            venue,
            image,
            description,
            price,
            category,
            url: fullUrl
        };

    } catch (error) {
        console.error(`Error scraping ${programUrl}:`, error.message);
        return null;
    }
}

async function main() {
    console.log(`Fetching event list from ${ENTRY_POINT}...`);
    try {
        const response = await axios.get(ENTRY_POINT);
        const $ = cheerio.load(response.data);

        const programLinks = new Set();

        // Find all program links in the list
        // Based on inspection: .programBox .mainImgContainer a OR .programBox .infoContent a
        // href usually looks like /program/name-id
        $('.programBox a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/program/')) {
                // Ensure we clean the URL or handle relative paths if necessary
                // The hrefs in the sample seemed to be full URLs often, but let's be safe
                programLinks.add(href);
            }
        });

        console.log(`Found ${programLinks.size} unique event links.`);

        const events = [];
        // Sequential scraping to be polite
        for (const link of programLinks) {
            const eventData = await scrapeEventDetails(link);
            if (eventData) {
                events.push(eventData);
                console.log(`Scraped: ${eventData.title} (${eventData.category})`);
            }
            // Small delay
            await new Promise(r => setTimeout(r, 500));
        }

        // Filter out empty/invalid events (often secondary performance links)
        const validEvents = events.filter(e => e.date && e.description.length > 0);

        fs.writeFileSync('rialto_events.json', JSON.stringify(validEvents, null, 2));
        console.log(`Successfully saved ${validEvents.length} valid events to rialto_events.json`);

    } catch (error) {
        console.error('Main scraper error:', error);
    }
}

main();
