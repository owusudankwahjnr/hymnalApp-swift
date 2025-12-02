const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8000/api/v1'; // Adjust if needed

async function fetchData() {
    try {
        console.log('Fetching hymn books...');
        const booksResponse = await fetch(`${API_URL}/hymnal/hymn_books?limit=100`);
        const books = await booksResponse.json();

        const allData = {
            books: [],
            hymns: []
        };

        for (const book of books) {
            console.log(`Fetching hymns for book: ${book.title}...`);
            const hymnsResponse = await fetch(`${API_URL}/hymnal/hymn_books/${book.id}/hymns?limit=1000`);
            const hymnsSummaries = await hymnsResponse.json();

            // Fetch full details for each hymn
            console.log(`Fetching details for ${hymnsSummaries.length} hymns in ${book.title}...`);
            for (const summary of hymnsSummaries) {
                try {
                    const detailResponse = await fetch(`${API_URL}/hymnal/hymns/${summary.id}`);
                    if (detailResponse.ok) {
                        const hymnDetail = await detailResponse.json();
                        allData.hymns.push(hymnDetail);
                    } else {
                        console.error(`Failed to fetch details for hymn ${summary.id}`);
                    }
                } catch (e) {
                    console.error(`Error fetching hymn ${summary.id}:`, e);
                }
            }

            // Add hymn count to book
            book.hymn_count = hymnsSummaries.length;
            allData.books.push(book);
        }

        const outputPath = path.join(__dirname, '../src/assets/hymnal_data.json');
        const dir = path.dirname(outputPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
        console.log(`Data successfully saved to ${outputPath}`);
        console.log(`Total Books: ${allData.books.length}`);
        console.log(`Total Hymns: ${allData.hymns.length}`);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();
