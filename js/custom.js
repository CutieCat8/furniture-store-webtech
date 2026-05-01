(function() {
	'use strict';

	// Product data flow: requestProducts() -> fetch(JSON) -> renderUI(data)
	// This is intentionally standalone so pages without a product grid are unaffected.
	function requestProducts() {
		var jsonPath = 'data/json/products.json';

		// Fetch product data from a local JSON file and pass it to renderUI.
		return fetch(jsonPath)
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Failed to load product data: ' + response.status);
				}
				return response.json();
			})
			.then(function(products) {
				renderUI(products);
				setupSearch(products);
				return products;
			})
			.catch(function(error) {
				// Fail silently on pages that do not require product rendering.
				console.error(error);
			});
	}

	function renderUI(products) {
		// Only render if a target grid exists.
		var grid = document.querySelector('[data-products-grid]');
		if (!grid || !Array.isArray(products)) {
			return;
		}

		// Convert product objects into the HTML structure used by .product-item cards.
		var cards = products.map(function(item) {
			var title = item.title || 'Product';
			return (
				'<div class="col-12 col-md-4 col-lg-3 mb-5">' +
					'<a class="product-item" href="' + item.href + '">' +
						'<img src="' + item.image + '" class="img-fluid product-thumbnail" alt="' + title + '">' +
						'<h3 class="product-title">' + title + '</h3>' +
						'<strong class="product-price">' + item.price + '</strong>' +
						'<span class="icon-cross">' +
							'<img src="' + item.icon + '" class="img-fluid" alt="Add to cart">' +
						'</span>' +
					'</a>' +
				'</div>'
			);
		}).join('');

		// Replace existing grid contents with new cards from JSON.
		grid.innerHTML = cards;
	}

	function setupSearch(products) {
		var input = document.querySelector('[data-products-search]');
		var button = document.querySelector('[data-products-search-btn]');
		var emptyState = document.querySelector('[data-products-empty]');
		var suggestions = document.querySelector('[data-products-suggestions]');

		if (!input || !button || !Array.isArray(products)) {
			return;
		}

		function updateSuggestions(list) {
			if (!suggestions) {
				return;
			}

			if (!list.length) {
				suggestions.style.display = 'none';
				suggestions.innerHTML = '';
				return;
			}

			var items = list.slice(0, 5).map(function(item) {
				var title = item.title || 'Product';
				return (
					'<button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-2" data-suggestion-title="' + title.replace(/"/g, '&quot;') + '">' +
						'<img src="' + item.image + '" alt="' + title + '" style="width: 36px; height: 36px; object-fit: cover;">' +
						'<span>' + title + '</span>' +
					'</button>'
				);
			}).join('');

			suggestions.innerHTML = items;
			suggestions.style.display = 'block';
		}

		function runSearch() {
			var query = input.value.trim().toLowerCase();
			var filtered = query
				? products.filter(function(item) {
					return (item.title || '').toLowerCase().indexOf(query) !== -1;
				})
				: products;

			renderUI(filtered);
			updateSuggestions(query ? filtered : []);

			if (emptyState) {
				emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
			}
		}

		button.addEventListener('click', function(event) {
			event.preventDefault();
			runSearch();
		});

		input.addEventListener('input', runSearch);
		if (suggestions) {
			suggestions.addEventListener('click', function(event) {
				var target = event.target.closest('[data-suggestion-title]');
				if (!target) {
					return;
				}
				input.value = target.getAttribute('data-suggestion-title') || '';
				runSearch();
			});
		}
		input.addEventListener('keydown', function(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				runSearch();
			}
		});

		// Render initial state (show all products).
		runSearch();
	}

	// Kick off the data request after DOM is ready.
	document.addEventListener('DOMContentLoaded', function() {
		requestProducts();
	});

	var tinyslider = function() {
		var el = document.querySelectorAll('.testimonial-slider');

		if (el.length > 0) {
			var slider = tns({
				container: '.testimonial-slider',
				items: 1,
				axis: "horizontal",
				controlsContainer: "#testimonial-nav",
				swipeAngle: false,
				speed: 700,
				nav: true,
				controls: true,
				autoplay: true,
				autoplayHoverPause: true,
				autoplayTimeout: 3500,
				autoplayButtonOutput: false
			});
		}
	};
	tinyslider();

	


	var sitePlusMinus = function() {

		var value,
    		quantity = document.getElementsByClassName('quantity-container');

		function createBindings(quantityContainer) {
	      var quantityAmount = quantityContainer.getElementsByClassName('quantity-amount')[0];
	      var increase = quantityContainer.getElementsByClassName('increase')[0];
	      var decrease = quantityContainer.getElementsByClassName('decrease')[0];
	      increase.addEventListener('click', function (e) { increaseValue(e, quantityAmount); });
	      decrease.addEventListener('click', function (e) { decreaseValue(e, quantityAmount); });
	    }

	    function init() {
	        for (var i = 0; i < quantity.length; i++ ) {
						createBindings(quantity[i]);
	        }
	    };

	    function increaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        console.log(quantityAmount, quantityAmount.value);

	        value = isNaN(value) ? 0 : value;
	        value++;
	        quantityAmount.value = value;
	    }

	    function decreaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        value = isNaN(value) ? 0 : value;
	        if (value > 0) value--;

	        quantityAmount.value = value;
	    }
	    
	    init();
		
	};
	sitePlusMinus();


})()