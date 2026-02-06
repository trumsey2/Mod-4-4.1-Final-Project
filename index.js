// Art Institute of Chicago API:
// 12 artworks, fields include: Artwork ID (id), Artwork Title (title), Artist (artist_display), Date (date_display), Ref Number (main_reference_number)
// --> https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_display,main_reference_number

const API_URL = 'https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_display,main_reference_number&limit=100';

// To Store Arrays:
let allArtworks = [];
let artists = [];

// To Store Dynamic Data:
let artistCounts = {}; 

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// Fetch Data
async function fetchData() {
    const grid = document.getElementById('artist-grid');
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allArtworks = data.data;

        // Process Artists
        processArtists();
        
        // Render Initial Grid
        renderArtists();

    } catch (error) {
        console.error('Error fetching data:', error);
        grid.innerHTML = '<div class="error">Failed to load artists. Please try again later.</div>';
    }
}

function processArtists() {
    const rawArtists = allArtworks.map(work => work.artist_display).filter(name => name);

    // Count artworks per artist
    artistCounts = rawArtists.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    // Get unique artists
    artists = Object.keys(artistCounts);
}

// Render Artists
function renderArtists() {
    const grid = document.getElementById('artist-grid');
    const sortValue = document.getElementById('sort-select').value;
    const searchValue = document.getElementById('artist-search').value.toLowerCase();

    // Filter Logic
    let filteredArtists = artists.filter(artist =>
        artist.toLowerCase().includes(searchValue)
    );
    
    // Sort Logic
    let sortedArtists = [...filteredArtists];
    if (sortValue === 'asc') {
        sortedArtists.sort((a, b) => a.localeCompare(b));
    } else if (sortValue === 'desc') {
        sortedArtists.sort((a, b) => b.localeCompare(a));
    }

    grid.innerHTML = '';

    if (sortedArtists.length === 0) {
        grid.innerHTML = '<div class="no artists found matching your search.</div>';
        return;
    }
    
    sortedArtists.forEach(artist => {
        // Clean up name for display (take first line if multiline)
        const displayName = artist.split('\n')[0].trim();
        
        const card = document.createElement('div');
        card.className = 'artist-card';
        card.onclick = () => openArtistWorks(artist);
        
        card.innerHTML = `
            <div class="artist-name">${displayName}</div>
            <div class="artist-count">${artistCounts[artist]} Work${artistCounts[artist] > 1 ? 's' : ''}</div>
        `;
        
        grid.appendChild(card);
    });
}

// Handle Sorting
function handleSort() {
    renderArtists();
}

// Handle Search
function handleSearch() {
    renderArtists();
}

// Navigation
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function scrollToGallery() {
    document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
}

function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // If on works page, go home first then scroll
        navigateTo('home');
        setTimeout(() => {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// Works Page Logic
function openArtistWorks(artistName) {
    const worksGrid = document.getElementById('works-grid');
    const title = document.getElementById('selected-artist-name');
    
    // Set Title (clean name)
    title.textContent = artistName.split('\n')[0].trim();
    
    // Filter works
    const works = allArtworks.filter(work => work.artist_display === artistName);
    
    // Render Works
    worksGrid.innerHTML = '';
    
    if (works.length === 0) {
        worksGrid.innerHTML = '<p>No works found.</p>';
        return;
    }
    
    works.forEach(work => {
        const item = document.createElement('div');
        item.className = 'work-item';
        
        const refNum = work.main_reference_number ? `Ref: ${work.main_reference_number}` : '';
        const date = work.date_display ? work.date_display : 'Unknown Date';
        
        item.innerHTML = `
            <div class="work-info">
                <div class="work-title">${work.title}</div>
                <div class="work-meta">${date}</div>
            </div>
            <div class="work-ref">${refNum}</div>
        `;
        
        worksGrid.appendChild(item);
    });
    
    navigateTo('works');
}

// Contact Form
function handleContact(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you shortly.');
    event.target.reset();
}