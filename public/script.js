const resultSection = document.querySelector('#main > aside');
const articleSection = document.querySelector('#main > article');
const textElement = articleSection.querySelector('p');
const pasteTextBtn = document.getElementById('pasteTextBtn');
const pageBlocker = document.getElementById('pageBlocker');
const searchBox = document.getElementById('searchBox');

const results = [];

var text = '';
var failed = false;
var noresult = false;

const showResultSection = (show) => show ? resultSection.style.display = 'block' : resultSection.style.display = 'none';
const showPageBlocker = (show) => show ? pageBlocker.style.display = 'flex' : pageBlocker.style.display = 'none';

function filterWord(word) {
    const alphabet = `abcçdefgğhıijklmnoöprsştuüvyzABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ`;
    var newWord = '';

    for (let i=0; i<word.length; i++) {
        let isAlphabet = true;

        for (let j=0; j<alphabet.length; j++) {
            if (word[i] !== alphabet[j]) {
                isAlphabet = false;
            }
            else {
                isAlphabet = true;
                break;
            }
        }

        if (isAlphabet) newWord += word[i];
    }

    return newWord;
}

pasteTextBtn.addEventListener('click', () => {
    navigator.clipboard.readText().then(t => {
        text = t;        
        textElement.innerText = t;
        transformTextToButtons();
    });
});

searchBox.addEventListener('keydown', async (e) => {
    if (e.key == 'Enter') {
        await search(filterWord(searchBox.value));
    }
});

function transformTextToButtons() {
    const words = text.split(' ');
    
    articleSection.innerHTML = '';

    for (let i=0; i<words.length; i++) {
        const btn = document.createElement('a');
        const space = document.createElement('span');

        space.innerText = ' ';
        
        btn.href = '#';
        btn.innerText = words[i];

        btn.addEventListener('click', (e) => {
            e.preventDefault();

            searchBox.value = filterWord(words[i]); 
        });
        
        articleSection.appendChild(btn);
        articleSection.appendChild(space);
    }
}

async function search(word) {
    showPageBlocker(true);

    await getResult(word);

    showPageBlocker(false);
    
    if (failed) {
        alert('Bir hata oluştu!');
    } else if (noresult) {
        alert('Kelime bulunamadı!');
    } else {
        displayResults();
    }
}

async function getResult(word) {
    word = filterWord(word);
    
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const res = await fetch(`http://localhost:3000/word/${word}`, options);

        if (res.status == 500) {
            failed = true;
            return;
        } else if (res.status == 204) {
            noresult = true;
            return;
        } else if (res.status == 200) {
            results.push(await res.json());
            failed = false;
            noresult = false;
            return;
        }
    } catch(err) {
        failed = true;
    }
}

function displayResults() {
    showResultSection(true);

    var html = '';
    html += '<ul>';
    
    for (let i=0; i<results.length; i++) {
        const word = results[i].word;

        html += '<li>';
            html += `<header class="result-header">
                <strong>${word}</strong>
                <span class="material-symbols-outlined">arrow_drop_down</span>
            </header>`;
            
            html += `<main style="display: none;">`;    

            for (let j=0; j<results[i].results.length; j++) {
                const mean = results[i].results[j]?.mean;
                const kinds = results[i].results[j]?.kinds;
                const sampleSentence = results[i].results[j]?.sampleSentence;
                const sampleSentenceAuthor = results[i].results[j]?.sampleSentenceAuthor;
            
                if (kinds && kinds.length > 0) html += `<div><strong>Tür: </strong>${kinds.join(' | ')}</div>`;
                if (mean) html += `<div><strong>Anlam: </strong>${mean}</div>`;
                if (sampleSentence) html += `<div><strong>Örnek: </strong>${sampleSentence}</div>`;
                if (sampleSentenceAuthor) html += `<div><strong>-</strong>${sampleSentenceAuthor}</div>`;

                html += '<div style="text-align: center;"><span>*   *   *</span></div>';
            }

            html += `</main>`;
                
        html += '</li>';
    }
        
    html += '</ul>';
    resultSection.innerHTML = html;

    const resultHeader = document.querySelectorAll('.result-header');

    resultHeader.forEach(rh => rh.addEventListener('click', () => {
        const parent = rh.parentElement.querySelector('main');
    
        if (parent.style.display == null || parent.style.display == 'none') {
            parent.style.display = 'block';
        } else {
            parent.style.display = 'none';
        }
    }));
}

function main() {
    showResultSection(false);
    text = sampleText;
    transformTextToButtons();
}

main();

