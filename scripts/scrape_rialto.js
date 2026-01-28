
/**
 * REFACTORED: Scrape Rialto using RialtoScraperTool and FileSystemTool
 */
const { RialtoScraperTool, FileSystemTool } = require('./tools/dist'); // Assuming compiled; or just keeping logic encapsulated

async function main() {
    console.log(`Starting Rialto Scraper via tool isolation...`);
    try {
        const programLinks = await RialtoScraperTool.getEventLinks();
        console.log(`Found ${programLinks.length} unique event links.`);

        const events = [];
        for (const link of programLinks) {
            const eventData = await RialtoScraperTool.scrapeEventDetails(link);
            if (eventData) {
                events.push(eventData);
                console.log(`Scraped: ${eventData.title} (${eventData.category})`);
            }
            await new Promise(r => setTimeout(r, 500));
        }

        const validEvents = events.filter(e => e.date && e.description.length > 0);
        FileSystemTool.writeJson('rialto_events.json', validEvents);
        console.log(`Successfully saved ${validEvents.length} valid events to rialto_events.json`);

    } catch (error) {
        console.error('Main scraper error:', error);
    }
}

main();
