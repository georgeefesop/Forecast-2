import * as fs from 'fs';

async function check() {
    const data = JSON.parse(fs.readFileSync('myticketcy_perf.json', 'utf8'));

    data.forEach((item: any) => {
        console.log(`\nChecking [${item.title.rendered}]...`);
        const content = item.content.rendered;
        if (content.includes('Event Details')) {
            console.log(' - FOUND "Event Details" in content!');
        } else {
            console.log(' - "Event Details" NOT in content.');
            // Log a bit of content to see what's there
            console.log('   Content Length:', content.length);
            if (content.length > 0) {
                console.log('   Preview:', content.substring(0, 100));
            }
        }
    });
}

check();
