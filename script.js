const booksList = [
    'Genesis',         'Exodus',          'Leviticus',     'Numbers',
    'Deuteronomy',     'Joshua',          'Judges',        'Ruth',
    '1 Samuel',        '2 Samuel',        '1 Kings',       '2 Kings',
    '1 Chronicles',    '2 Chronicles',    'Ezra',          'Nehemiah',
    'Esther',          'Job',             'Psalm',         'Proverbs',
    'Ecclesiastes',    'Song of Solomon', 'Isaiah',        'Jeremiah',
    'Lamentations',    'Ezekiel',         'Daniel',        'Hosea',
    'Joel',            'Amos',            'Obadiah',       'Jonah',
    'Micah',           'Nahum',           'Habakkuk',      'Zephaniah',
    'Haggai',          'Zechariah',       'Malachi',       'Matthew',
    'Mark',            'Luke',            'John',          'Acts',
    'Romans',          '1 Corinthians',   '2 Corinthians', 'Galatians',
    'Ephesians',       'Philippians',     'Colossians',    '1 Thessalonians', 
    '2 Thessalonians', '1 Timothy',       '2 Timothy',     'Titus',
    'Philemon',        'Hebrews',         'James',         '1 Peter',
    '2 Peter',         '1 John',          '2 John',        '3 John',
    'Jude',            'Revelation'
];
async function getVerse(book, chapter, verse) {
    var bookNum = booksList.indexOf(book) + 1;
    const url = `https://bolls.life/get-text/NASB/${bookNum}/${chapter}/`;

        try {
        // Fetch data from the URL
        const response = await fetch(url);
        
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        // Parse JSON data from response
        const data = await response.json();

        // Find the verse with matching verse number
        const foundVerse = data.find(v => v.verse === parseInt(verse));

        // Check if the verse is found
        if (foundVerse) {
            return foundVerse.text;
        } else {
            throw new Error(`Verse ${verse} not found in ${book} ${chapter}`);
        }

    } catch (error) {
        console.error('Error fetching data:', error.message);
        return null; // Return null or handle the error as needed
    }
}

async function getChapter(book, chapter) {
    var bookNum = booksList.indexOf(book) + 1;

    const url = `https://bolls.life/get-text/NASB/${bookNum}/${chapter}/`;

    try {
        // Fetch data from the URL
        const response = await fetch(url);
        
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        // Parse JSON data from response
        const data = await response.json();

        // Initialize an empty string to accumulate the HTML
        let chapterHtml = '';

        // Loop through each verse in the data array
        if(bookNum === 22 || bookNum === 23 || bookNum === 24 || bookNum === 25){
            data.forEach(verseObj => {
                chapterHtml += `<p style="display:inline;"><sup><b>${verseObj.verse}</b></sup> ${verseObj.text}</p>`;
            });
        }
        else{
            data.forEach(verseObj => {
                chapterHtml += `<p><sup><b>${verseObj.verse}</b></sup> ${verseObj.text}</p>`;
            });
        }

        // Return the formatted chapter HTML
        return chapterHtml;

    } catch (error) {
        console.error('Error fetching data:', error);
        return ''; // Return an empty string in case of error
    }
}

window.addEventListener("load", async (event) => {
    const aTags = document.getElementsByTagName("a");

    console.log("Found anchor tags:", aTags.length);

    for (let verseLink of aTags) {
        console.log("Processing anchor tag:", verseLink.href);
        console.log(verseLink.href.split("#")[1]);
        if (booksList.includes(verseLink.href.split("#")[1].split("-")[0])) {
            console.log("Got to first if");
            let verseLinkList = verseLink.href.split("#")[1].split("-");
            let book = verseLinkList[0];
            let chapter = verseLinkList[1];
            let verse = verseLinkList[2];

            console.log(book, chapter, verse);

            if (verse && verseLinkList.length === 3) {
                try {
                    let verseText = await getVerse(book, chapter, verse);
                    if (verseText) {
                        console.log(`Verse ${book} ${chapter}:${verse} loaded`);
                        createPopup(verseLink, book, chapter, verse, verseText);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else if (chapter && verseLinkList.length === 2) {
                try {
                    let verseText = await getChapter(book, chapter);
                    if (verseText) {
                        console.log(`Chapter ${book} ${chapter} loaded`);
                        createPopup(verseLink, book, chapter, null, verseText);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
});

function createPopup(verseLink, book, chapter, verse, verseText) {
    console.log("Got to popup stage");
    let popup = document.createElement("div");
    popup.style.display = "none";
    popup.style.position = "fixed";
    popup.style.zIndex = "3";
    popup.style.paddingTop = "100px";
    popup.style.width = "300px";
    popup.style.height = "300px";
    popup.style.overflow = "auto";
    popup.style.padding = "10px";
    popup.style.border = "1px solid black";
    popup.classList.add("verse-modal");

    let popupContent = `<span onclick="this.parentNode.style.display='none'" style="position:absolute;right:0;top:10px;width:30px;height:30px;cursor:pointer;">&times;</span><h4><b>${book} ${chapter}${verse ? ':' + verse : ''} NASB</b></h4><br><p>${verseText}</p>`;
    popup.innerHTML = popupContent;
    document.body.appendChild(popup);

    verseLink.addEventListener("click", function(event) {
        event.preventDefault();
        popup.style.display = "block";
    });

    console.log(`Popup created for ${book} ${chapter}${verse ? ':' + verse : ''}`);
}
