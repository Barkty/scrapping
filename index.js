// Scraping with jquery
const { JSDOM } = require( "jsdom" );
const axios = require('axios'); 
const cheerio = require('cheerio'); 
const { insertIntoDB } = require("./db");
 
// initialize JSOM in the "https://target-domain.com/" page 
// to avoid CORS problems 
const { window } = new JSDOM("", { 
	url: "https://scrapeme.live/shop/", 
}); 
const $ = require( "jquery" )( window ); 
 
// scraping https://target-domain.com/ web pages
$.get("https://scrapeme.live/shop/", async function(html) { 
	// retrieve the list of all HTML products
	const productHTMLElements = $(html).find("li.product"); 
    const products = []; 
	// populate products with the scraped data 
	productHTMLElements.each((i, productHTML) => { 
		// scrape data from the product HTML element 
		const product = { 
			name: $(productHTML).find("h2").text(), 
			url: $(productHTML).find("a").attr("href"), 
			image: $(productHTML).find("img").attr("src"), 
			price: $(productHTML).find("span").first().text(), 
            // store the original HTML content 
	        html: $(productHTML).html() 
		}; 
 
		products.push(product); 
	}); 
 
	console.log(products.length);
    // store in a DB 
	// await insertIntoDB('INSERT INTO products', products)
});

// Scrapping with axios and cheerio 
axios.get('https://scrapeme.live/shop/') 
	.then(({ data }) => { 
		const $ = cheerio.load(data); 
 
		const pokemons = $('li.product') 
			.map((_, pokemon) => { 
				const $pokemon = $(pokemon); 
				const name = $pokemon.find('.woocommerce-loop-product__title').text() 
				const price = $pokemon.find('.woocommerce-Price-amount').text() 
				return {'name': name, 'price': price} 
			}) 
			.toArray(); 
		console.log(pokemons) 
	});

// async function main() {
// 	const pageHTML = await axios.get("https://scrapeme.live/shop")
// 	const $ = cheerio.load(pageHTML.data)
// 	// retrieving the pagination URLs 
// 	$(".page-numbers a").each((index, element) => { 
// 		const paginationURL = $(element).attr("href") 
// 	})
// 	// retrieving the product URLs 
// 	$("li.product a.woocommerce-LoopProduct-link").each((index, element) => { 
// 		const productURL = $(element).attr("href") 
// 	})
// }

// await main()
 
async function main(maxPages = 50) { 
	// initialized with the first webpage to visit 
	const paginationURLsToVisit = ["https://scrapeme.live/shop"]; 
	const visitedURLs = []; 
 
	const productURLs = new Set(); 
 
	// iterating until the queue is empty 
	// or the iteration limit is hit 
	while ( 
		paginationURLsToVisit.length !== 0 && 
		visitedURLs.length <= maxPages 
	) { 
		// the current webpage to crawl 
		const paginationURL = paginationURLsToVisit.pop(); 
 
		// retrieving the HTML content from paginationURL 
		const pageHTML = await axios.get(paginationURL); 
 
		// adding the current webpage to the 
		// web pages already crawled 
		visitedURLs.push(paginationURL); 
 
		// initializing cheerio on the current webpage 
		const $ = cheerio.load(pageHTML.data); 
 
		// retrieving the pagination URLs 
		$(".page-numbers a").each((index, element) => { 
			const paginationURL = $(element).attr("href"); 
 
			// adding the pagination URL to the queue 
			// of web pages to crawl, if it wasn't yet crawled 
			if ( 
				!visitedURLs.includes(paginationURL) && 
				!paginationURLsToVisit.includes(paginationURL) 
			) { 
				paginationURLsToVisit.push(paginationURL); 
			} 
		}); 
 
		// retrieving the product URLs 
		$("li.product").each((index, productHTML) => { 
			const product = { 
				name: $(productHTML).find("h2").text(), 
				url: $(productHTML).find("a").attr("href"), 
				image: $(productHTML).find("img").attr("src"), 
				price: $(productHTML).find("span").first().text(), 
				// store the original HTML content 
				html: $(productHTML).html() 
			}; 
			// const productURL = $(element).attr("href"); 
			productURLs.add(product); 
		}); 
	} 
 
	// logging the crawling results 
	console.log([...productURLs]); 
 
	// use productURLs for scraping purposes... 
} 
 
// running the main() function 
main() 
	.then(() => { 
		// successful ending 
		process.exit(0); 
	}) 
	.catch((e) => { 
		// logging the error message 
		console.error(e); 
 
		// unsuccessful ending 
		process.exit(1); 
	});
