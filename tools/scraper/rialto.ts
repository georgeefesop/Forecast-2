
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Rialto Scraper Tool
 * Encapsulates scraping logic for the Rialto Theatre website.
 */

export interface RialtoEvent {
    title: string;
    date: string;
    venue: string;
    image?: string;
    description: string;
    price: string;
    category: string;
    url: string;
}

export class RialtoScraperTool {
    private static readonly BASE_URL = 'https://rialto.interticket.com';
    private static readonly ENTRY_POINT = 'https://rialto.interticket.com/ticketsearch';

    private static readonly CATEGORY_KEYWORDS: Record<string, string[]> = {
        'Theatre': ['play', 'stage', 'drama', 'theatre', 'performance', 'tragedy', 'comedy', 'love', 'physical theater', 'actor', 'directing'],
        'Music': ['concert', 'music', 'live', 'piano', 'violin', 'orchestra', 'symphony', 'recital', 'band', 'song', 'singer', 'musical'],
        'Dance': ['dance', 'ballet', 'choreography', 'dancer'],
        'Cinema': ['film', 'movie', 'screening', 'documentary', 'director', 'cinema'],
        'Festival': ['festival']
    };

    private static inferCategory(title: string, description: string): string {
        const text = `${title} ${description}`.toLowerCase();
        for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        return 'Other';
    }

    /**
     * Fetch the list of event program URLs.
     */
    static async getEventLinks(): Promise<string[]> {
        const response = await axios.get(this.ENTRY_POINT);
        const $ = cheerio.load(response.data);
        const links = new Set<string>();

        $('.programBox a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/program/')) {
                links.add(href);
            }
        });

        return Array.from(links);
    }

    /**
     * Scrape details for a specific event link.
     */
    static async scrapeEventDetails(programUrl: string): Promise<RialtoEvent | null> {
        try {
            const fullUrl = programUrl.startsWith('http') ? programUrl : `${this.BASE_URL}/${programUrl}`;
            const response = await axios.get(fullUrl);
            const $ = cheerio.load(response.data);

            const title = $('div.programInfo > h1').text().trim();
            const dateStr = $('time.ticketTime').attr('datetime') || $('time.ticketTime').text().trim();
            const venue = $('a.place').first().text().trim().replace(/[\n\t]+/g, ' ');
            const image = $('img.mainImg').attr('src');
            const description = $('.programDescription').text().trim();
            const price = $('.ticketBoxOne .price').first().text().trim();

            const category = this.inferCategory(title, description);

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
            console.error(`RialtoScraperTool error for ${programUrl}:`, error);
            return null;
        }
    }
}
