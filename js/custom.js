(function() {
	'use strict';

	var CART_KEY = 'furni-cart';

	function getCart() {
		try {
			var raw = localStorage.getItem(CART_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (error) {
			return [];
		}
	}

	function saveCart(cart) {
		localStorage.setItem(CART_KEY, JSON.stringify(cart));
	}

	function getCartCount(cart) {
		return cart.reduce(function(total, item) {
			return total + item.qty;
		}, 0);
	}

	function ensureCartBadge() {
		var cartLink = document.querySelector('.custom-navbar-cta a[href="cart.html"]');
		if (!cartLink) {
			return null;
		}
		var badge = cartLink.querySelector('[data-cart-count]');
		if (!badge) {
			badge = document.createElement('span');
			badge.className = 'cart-count-badge';
			badge.setAttribute('data-cart-count', '');
			cartLink.appendChild(badge);
		}
		return badge;
	}

	function updateCartCount() {
		var badge = ensureCartBadge();
		if (!badge) {
			return;
		}
		var count = getCartCount(getCart());
		badge.textContent = count;
		badge.style.display = count > 0 ? 'inline-block' : 'none';
	}

	var lastToastProductId = null;
	var lastToastCount = 0;

	function ensureToastStack() {
		var stack = document.querySelector('[data-cart-toast-stack]');
		if (!stack) {
			stack = document.createElement('div');
			stack.className = 'cart-toast-stack';
			stack.setAttribute('data-cart-toast-stack', '');
			document.body.appendChild(stack);
		}
		return stack;
	}

	function enqueueToast(message) {
		var stack = ensureToastStack();
		var toast = document.createElement('div');
		toast.className = 'cart-toast';
		toast.textContent = message;
		stack.appendChild(toast);

		requestAnimationFrame(function() {
			toast.classList.add('is-visible');
		});

		setTimeout(function() {
			toast.classList.remove('is-visible');
			setTimeout(function() {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			}, 200);
		}, 1000);
	}

	function addToCart(productId) {
		var cart = getCart();
		var existing = cart.find(function(item) {
			return item.id === productId;
		});
		if (existing) {
			existing.qty += 1;
		} else {
			cart.push({ id: productId, qty: 1 });
		}
		saveCart(cart);
		updateCartCount();
	}

	function buildProductsMap(products) {
		return products.reduce(function(map, item) {
			if (item && item.id) {
				map[item.id] = item;
			}
			return map;
		}, {});
	}

	function parsePrice(value) {
		if (typeof value === 'number') {
			return value;
		}
		if (!value) {
			return 0;
		}
		return parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
	}

	function formatPrice(value) {
		return '$' + value.toFixed(2);
	}

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
				var productsById = buildProductsMap(products);
				renderUI(products);
				setupSearch(products);
				setupAddToCart(productsById);
				setupCartPage(productsById);
				setupCheckoutPage(productsById);
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
			var productId = item.id || '';
			return (
				'<div class="col-12 col-md-4 col-lg-3 mb-5">' +
					'<a class="product-item" href="' + item.href + '" data-product-id="' + productId + '">' +
						'<img src="' + item.image + '" class="img-fluid product-thumbnail" alt="' + title + '">' +
						'<h3 class="product-title">' + title + '</h3>' +
						'<strong class="product-price">' + item.price + '</strong>' +
						'<span class="icon-cross" data-add-to-cart role="button" aria-label="Add to cart">' +
							'<img src="' + item.icon + '" class="img-fluid" alt="Add to cart">' +
						'</span>' +
					'</a>' +
				'</div>'
			);
		}).join('');

		// Replace existing grid contents with new cards from JSON.
		grid.innerHTML = cards;
	}

	function setupAddToCart(productsById) {
		if (!productsById || !Object.keys(productsById).length) {
			return;
		}

		document.addEventListener('click', function(event) {
			var addButton = event.target.closest('[data-add-to-cart]');
			if (!addButton) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();

			var productLink = addButton.closest('[data-product-id]');
			if (!productLink) {
				return;
			}
			var productId = productLink.getAttribute('data-product-id');
			if (!productId || !productsById[productId]) {
				return;
			}
			addToCart(productId);
			addButton.classList.remove('add-to-cart-pulse');
			void addButton.offsetWidth;
			addButton.classList.add('add-to-cart-pulse');

			if (productId === lastToastProductId) {
				lastToastCount += 1;
			} else {
				lastToastProductId = productId;
				lastToastCount = 1;
			}

			var title = productsById[productId].title;
			var suffix = lastToastCount > 1 ? ' ' + lastToastCount : '';
			enqueueToast('Added: ' + title + suffix);
		});
	}

	function renderCartTable(cart, productsById) {
		var body = document.querySelector('[data-cart-body]');
		if (!body) {
			return;
		}

		if (!cart.length) {
			body.innerHTML = '<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>';
			updateCartTotals(0);
			return;
		}

		var rows = cart.map(function(item) {
			var product = productsById[item.id];
			if (!product) {
				return '';
			}
			var price = parsePrice(product.price);
			var lineTotal = price * item.qty;
			return (
				'<tr data-cart-id="' + item.id + '">' +
					'<td class="product-thumbnail">' +
						'<img src="' + product.image + '" alt="' + product.title + '" class="img-fluid">' +
					'</td>' +
					'<td class="product-name">' +
						'<h2 class="h5 text-black">' + product.title + '</h2>' +
					'</td>' +
					'<td>' + formatPrice(price) + '</td>' +
					'<td>' +
						'<div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">' +
							'<div class="input-group-prepend">' +
								'<button class="btn btn-outline-black decrease" type="button">&minus;</button>' +
							'</div>' +
							'<input type="text" class="form-control text-center quantity-amount" value="' + item.qty + '" inputmode="numeric" pattern="[0-9]*">' +
							'<div class="input-group-append">' +
								'<button class="btn btn-outline-black increase" type="button">&plus;</button>' +
							'</div>' +
						'</div>' +
					'</td>' +
					'<td>' + formatPrice(lineTotal) + '</td>' +
					'<td><button type="button" class="btn btn-black btn-sm" data-cart-remove>Remove</button></td>' +
				'</tr>'
			);
		}).join('');

		body.innerHTML = rows;

		var subtotal = cart.reduce(function(total, item) {
			var product = productsById[item.id];
			if (!product) {
				return total;
			}
			return total + parsePrice(product.price) * item.qty;
		}, 0);

		updateCartTotals(subtotal);
	}

	function updateCartTotals(subtotal) {
		var subtotalEl = document.querySelector('[data-cart-subtotal]');
		var totalEl = document.querySelector('[data-cart-total]');
		if (subtotalEl) {
			subtotalEl.textContent = formatPrice(subtotal);
		}
		if (totalEl) {
			totalEl.textContent = formatPrice(subtotal);
		}
	}

	function setupCartPage(productsById) {
		var body = document.querySelector('[data-cart-body]');
		var clearButton = document.querySelector('[data-cart-clear]');
		if (!body) {
			return;
		}

		function refreshCart() {
			var cart = getCart();
			renderCartTable(cart, productsById);
			updateCartCount();
		}

		body.addEventListener('click', function(event) {
			var row = event.target.closest('[data-cart-id]');
			if (!row) {
				return;
			}
			var cart = getCart();
			var productId = row.getAttribute('data-cart-id');
			var item = cart.find(function(entry) {
				return entry.id === productId;
			});
			if (!item) {
				return;
			}

			if (event.target.closest('[data-cart-remove]')) {
				cart = cart.filter(function(entry) {
					return entry.id !== productId;
				});
				saveCart(cart);
				refreshCart();
				return;
			}

			if (event.target.closest('.increase')) {
				item.qty += 1;
				saveCart(cart);
				refreshCart();
				return;
			}

			if (event.target.closest('.decrease')) {
				item.qty = Math.max(1, item.qty - 1);
				saveCart(cart);
				refreshCart();
				return;
			}

			return;
		});

		body.addEventListener('change', function(event) {
			var input = event.target.closest('.quantity-amount');
			if (!input) {
				return;
			}
			var row = input.closest('[data-cart-id]');
			if (!row) {
				return;
			}
			var productId = row.getAttribute('data-cart-id');
			var cart = getCart();
			var item = cart.find(function(entry) {
				return entry.id === productId;
			});
			if (!item) {
				return;
			}
			var nextQty = parseInt(input.value, 10);
			if (isNaN(nextQty) || nextQty < 1) {
				nextQty = 1;
			}
			item.qty = nextQty;
			saveCart(cart);
			refreshCart();
		});

		if (clearButton) {
			clearButton.addEventListener('click', function() {
				saveCart([]);
				refreshCart();
			});
		}

		refreshCart();
	}

	function setupCheckoutPage(productsById) {
		var body = document.querySelector('[data-checkout-body]');
		if (!body) {
			return;
		}

		var cart = getCart();
		if (!cart.length) {
			body.innerHTML = '<tr><td colspan="2" class="text-center">Your cart is empty.</td></tr>';
			return;
		}

		var subtotal = 0;
		var rows = cart.map(function(item) {
			var product = productsById[item.id];
			if (!product) {
				return '';
			}
			var price = parsePrice(product.price);
			subtotal += price * item.qty;
			return (
				'<tr>' +
					'<td>' + product.title + ' <strong class="mx-2">x</strong> ' + item.qty + '</td>' +
					'<td>' + formatPrice(price * item.qty) + '</td>' +
				'</tr>'
			);
		}).join('');

		rows += (
			'<tr>' +
				'<td class="text-black font-weight-bold"><strong>Cart Subtotal</strong></td>' +
				'<td class="text-black">' + formatPrice(subtotal) + '</td>' +
			'</tr>' +
			'<tr>' +
				'<td class="text-black font-weight-bold"><strong>Order Total</strong></td>' +
				'<td class="text-black font-weight-bold"><strong>' + formatPrice(subtotal) + '</strong></td>' +
			'</tr>'
		);

		body.innerHTML = rows;

		var submitButton = document.querySelector('[data-checkout-submit]');
		var statusEl = document.querySelector('[data-checkout-status]');
		var emailInput = document.getElementById('c_email_address');
		var cardInput = document.getElementById('c_card_number');

		if (!submitButton || !statusEl || !emailInput || !cardInput) {
			return;
		}

		function setStatus(message, isSuccess) {
			statusEl.textContent = message || '';
			statusEl.classList.toggle('is-success', Boolean(isSuccess));
		}

		function buildCheckoutItems(cartItems) {
			return cartItems.map(function(item) {
				var product = productsById[item.id] || {};
				return {
					id: item.id,
					title: product.title || 'Product',
					price: product.price || 0,
					quantity: item.qty
				};
			});
		}

		function saveLastOrder(orderPayload, responseData) {
			var lastFour = String(orderPayload.cardNumber || '').replace(/\D/g, '').slice(-4);
			var receipt = {
				orderId: responseData.orderId || 'N/A',
				email: orderPayload.email,
				total: responseData.total || 0,
				items: orderPayload.cartItems || [],
				createdAt: new Date().toISOString(),
				cardLastFour: lastFour
			};
			localStorage.setItem('furni-last-order', JSON.stringify(receipt));
		}

		submitButton.addEventListener('click', function(event) {
			event.preventDefault();
			setStatus('Placing order...', false);

			var cartItems = getCart();
			var token = localStorage.getItem('authToken');
			var headers = {
				'Content-Type': 'application/json'
			};
			if (token) {
				headers.Authorization = 'Bearer ' + token;
			}
			var payload = {
				cartItems: buildCheckoutItems(cartItems),
				email: emailInput.value.trim(),
				cardNumber: cardInput.value.trim()
			};

			fetch('http://localhost:3000/api/checkout', {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(payload)
			})
				.then(function(response) {
					return response.json().catch(function() {
						return {};
					}).then(function(data) {
						return { ok: response.ok, data: data };
					});
				})
				.then(function(result) {
					if (!result.ok) {
						var message = result.data.message || 'Checkout failed';
						if (result.data.errors) {
							var details = Object.values(result.data.errors).join(' | ');
							message = message + ' - ' + details;
						}
						setStatus(message, false);
						return;
					}

					saveLastOrder(payload, result.data || {});
					// Success: clear cart only after order saved.
					saveCart([]);
					updateCartCount();
					setStatus('Order placed. Redirecting...', true);
					window.location.href = 'thankyou.html';
				})
				.catch(function() {
					setStatus('Network error. Please try again.', false);
				});
		});
	}

		function setupThankYouReceipt() {
			var receiptRoot = document.querySelector('[data-receipt]');
			if (!receiptRoot) {
				return;
			}

			var raw = localStorage.getItem('furni-last-order');
			if (!raw) {
				return;
			}

			var receipt = null;
			try {
				receipt = JSON.parse(raw);
			} catch (error) {
				return;
			}

			if (!receipt || !receipt.items) {
				return;
			}

			var orderIdEl = receiptRoot.querySelector('[data-receipt-order-id]');
			var dateEl = receiptRoot.querySelector('[data-receipt-date]');
			var emailEl = receiptRoot.querySelector('[data-receipt-email]');
			var totalEl = receiptRoot.querySelector('[data-receipt-total]');
			var itemsEl = receiptRoot.querySelector('[data-receipt-items]');
			var cardEl = receiptRoot.querySelector('[data-receipt-card]');

			if (orderIdEl) {
				orderIdEl.textContent = receipt.orderId;
			}
			if (dateEl) {
				dateEl.textContent = new Date(receipt.createdAt).toLocaleString();
			}
			if (emailEl) {
				emailEl.textContent = receipt.email;
			}
			if (totalEl) {
				totalEl.textContent = formatPrice(Number(receipt.total) || 0);
			}
			if (cardEl) {
				cardEl.textContent = receipt.cardLastFour ? '**** **** **** ' + receipt.cardLastFour : 'N/A';
			}

			if (itemsEl) {
				itemsEl.innerHTML = receipt.items.map(function(item) {
					var lineTotal = parsePrice(item.price) * Number(item.quantity || 0);
					return (
						'<div class="receipt-row">' +
							'<span>' + item.title + ' x' + item.quantity + '</span>' +
							'<span>' + formatPrice(lineTotal) + '</span>' +
						'</div>'
					);
				}).join('');
			}
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
		updateCartCount();
		requestProducts();
		setupThankYouReceipt();
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
		if (document.querySelector('[data-cart-body]')) {
			return;
		}

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