(function() {
    const self = {
      init: () => {
        if (window.location.pathname !== '/') {
          return;
        }
        self.fetchOrLoadProducts();
      },
  
      fetchOrLoadProducts: () => {
        const cachedProducts = localStorage.getItem('customCarouselProducts');
        if (cachedProducts) {
          self.buildCarousel(JSON.parse(cachedProducts));
        } else {
          fetch('https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json')
            .then(response => {
              if (!response.ok) throw new Error('Network response was not ok');
              return response.json();
            })
            .then(data => {
              localStorage.setItem('customCarouselProducts', JSON.stringify(data));
              self.buildCarousel(data);
            })
            .catch(error => console.error('Error fetching products:', error));
        }
      },
  
      buildCarousel: (products) => {
        self.buildHTML(products);
        self.buildCSS();
        self.setEvents(products);
      },
  
      buildHTML: (products) => {
        const favorites = JSON.parse(localStorage.getItem('customCarouselFavorites') || '[]');
        const carouselHtml = `
          <section class="custom-carousel-section">
            <h2 class="carousel-title">Beğenebileceğinizi Düşündüklerimiz</h2>
            <div class="custom-carousel">
              <div class="carousel-navigation">
                <button class="carousel-arrow left-arrow"><</button>
                <div class="carousel-wrapper">
                  <div class="carousel-container">
                    <div class="carousel-items">
                      ${products.map(product => {
                        const price = parseFloat(product.price);
                        const originalPrice = parseFloat(product.original_price);
                        const hasDiscount = Math.abs(price - originalPrice) > 0.01;
                        const discountLabel = product.discount_label || '';
                        const isBestseller = product.bestseller || false;
                        const formattedTitle = `<strong>${product.brand}</strong> - ${product.name.trim()}`;
                        return `
                          <div class="carousel-item" data-id="${product.id}">
                            ${isBestseller ? `<div class="bestseller-badge">ÇOK SATAN</div>` : ''}
                            ${discountLabel ? `<div class="discount-label">${discountLabel}</div>` : ''}
                            <a href="${product.url}" target="_blank" class="product-link">
                              <div class="product-image-container">
                                <img src="${product.img}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found';">
                              </div>
                              <div class="product-info">
                                <span class="product-name">${formattedTitle}</span>
                                <div class="rating-container">
                                  ${'★'.repeat(5)} <span class="review-count">(${product.review_count || 0})</span>
                                </div>
                                <div class="price-container">
                                  ${hasDiscount ? `
                                    <div class="original-price-container">
                                      <span class="original-price">${originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                      <span class="discount-amount">%${Math.round(((originalPrice - price) / originalPrice) * 100)}</span>
                                    </div>
                                    <span class="current-price">${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                  ` : `
                                    <span class="current-price">${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                  `}
                                </div>
                              </div>
                            </a>
                            <div class="heart-icon ${favorites.includes(product.id) ? 'favorited' : ''}" data-id="${product.id}"><span>♥</span></div>
                            <button class="add-to-cart-button">Sepete Ekle</button>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>
                <button class="carousel-arrow right-arrow">></button>
              </div>
            </div>
          </section>
        `;
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let targetSection = null;
        for (const heading of allHeadings) {
          if (heading.textContent.trim() === 'Sizin için Seçtiklerimiz') {
            targetSection = heading.closest('.cx-component') || heading.parentElement;
            break;
          }
        }
        if (targetSection) {
          targetSection.insertAdjacentHTML('beforebegin', carouselHtml);
        } else {
          document.body.insertAdjacentHTML('beforeend', carouselHtml);
        }
      },
  
      buildCSS: () => {
        const css = `
          .custom-carousel-section {
            max-width: 1500px;
            margin: 30px auto;
            padding: 0 15px;
            box-sizing: border-box;
            font-family: 'Open Sans', sans-serif;
            position: relative;
          }
          .carousel-title {
            font-family: 'Quicksand-Bold', sans-serif;
            font-size: 2.4rem;
            font-weight: 600;
            color: #f28e00;
            margin-bottom: 20px;
            text-align: left;
            background-color: #fff6eb;
            padding: 20px 30px;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
          }
          .custom-carousel {
            position: relative;
          }
          .carousel-navigation {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
          }
          .carousel-wrapper {
            flex: 1;
            overflow: hidden;
            position: relative;
          }
          .carousel-container {
            width: 100%;
            overflow: hidden;
            padding: 0 15px;
          }
          .carousel-items {
            display: flex;
            transition: transform 0.5s ease;
            gap: 15px;
          }
          .carousel-item {
            flex: 0 0 calc(33.33% - 10px);
            box-sizing: border-box;
            position: relative;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 10px;
            padding: 15px;
            text-align: left;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            min-height: 450px;
          }
          .carousel-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
          .product-link {
            text-decoration: none;
            color: inherit;
            display: block;
            flex: 1;
          }
          .product-image-container {
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            position: relative;
          }
          .product-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 10px 10px 0 0;
          }
          .product-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 0 10px;
            text-align: left;
          }
          .product-name {
            font-family: 'Open Sans', sans-serif;
            font-size: 1.4rem;
            color: #686868;
            height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 8px;
            line-height: 1.4;
            text-align: left;
          }
          .product-name strong {
            font-weight: bold;
          }
          .rating-container {
            color: #FFA500;
            font-size: 1.2rem;
            margin-bottom: 8px;
            text-align: left;
          }
          .review-count {
            color: #747881;
            margin-left: 3px;
            font-size: 1.2rem;
          }
          .price-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          .original-price-container {
            display: flex;
            gap: 5px;
            align-items: center;
          }
          .original-price {
            text-decoration: line-through;
            color: #747881;
            font-family: 'Quicksand-Medium', sans-serif;
            font-size: 1.6rem;
          }
          .current-price {
            font-family: 'Quicksand-Bold', sans-serif;
            font-size: 1.8rem;
            color: #747881;
            font-weight: 700;
          }
          .carousel-item.has-discount .current-price {
            color: #00a365;
          }
          .discount-amount {
            font-family: 'Quicksand-Bold', sans-serif;
            font-size: 1.2rem;
            color: #00a365;
            background-color: transparent;
            padding: 0;
            margin-left: 5px;
          }
          .bestseller-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: #f28e00;
            color: white;
            font-family: 'Quicksand-Bold', sans-serif;
            font-size: 1.2rem;
            padding: 4px 8px;
            border-radius: 5px;
            z-index: 2;
          }
          .discount-label {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: #00a365;
            color: white;
            font-family: 'Quicksand-Medium', sans-serif;
            font-size: 1.2rem;
            padding: 3px 6px;
            border-radius: 3px;
            z-index: 1;
          }
          .heart-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1;
            transition: all 0.3s ease;
          }
          .heart-icon span {
            font-size: 24px;
            color: #f28e00;
          }
          .heart-icon.favorited span {
            color: #f28e00;
            -webkit-text-fill-color: #f28e00;
            -webkit-text-stroke-width: 0;
          }
          .heart-icon:not(.favorited) span {
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke-width: 1px;
            -webkit-text-stroke-color: #f28e00;
          }
          .add-to-cart-button {
            background-color: #fff6eb;
            color: #f28e00;
            border: none;
            border-radius: 25px;
            padding: 12px 15px;
            font-family: 'Quicksand-Bold', sans-serif;
            font-size: 1.4rem;
            cursor: pointer;
            margin-top: 10px;
            transition: background-color 0.3s ease;
            width: 100%;
          }
          .add-to-cart-button:hover {
            background-color: #e07b00;
            color: white;
          }
          .carousel-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: #fff6eb;
            color: #f28e00;
            border: 1px solid #f28e00;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }
          .carousel-arrow.left-arrow {
            left: -50px;
          }
          .carousel-arrow.right-arrow {
            right: -50px;
          }
          .carousel-arrow:hover {
            background-color: #e07b00;
            color: white;
            border-color: #e07b00;
          }
          @media (max-width: 1200px) {
            .carousel-item { flex: 0 0 calc(50% - 8px); }
            .carousel-arrow.left-arrow { left: -40px; }
            .carousel-arrow.right-arrow { right: -40px; }
          }
          @media (max-width: 992px) {
            .carousel-item { flex: 0 0 calc(50% - 8px); }
            .carousel-arrow.left-arrow { left: -30px; }
            .carousel-arrow.right-arrow { right: -30px; }
          }
          @media (max-width: 768px) {
            .carousel-item { flex: 0 0 100%; }
            .carousel-arrow.left-arrow { left: -20px; }
            .carousel-arrow.right-arrow { right: -20px; }
          }
          @media (max-width: 480px) {
            .carousel-item { flex: 0 0 100%; }
            .carousel-arrow.left-arrow { left: -10px; }
            .carousel-arrow.right-arrow { right: -10px; }
          }
        `;
        const style = document.createElement('style');
        style.className = 'carousel-style';
        style.textContent = css;
        document.head.appendChild(style);
        document.querySelectorAll('.carousel-item').forEach(item => {
          const originalPrice = item.querySelector('.original-price');
          if (originalPrice) {
            item.classList.add('has-discount');
          }
        });
      },
  
      setEvents: (products) => {
        const itemsContainer = document.querySelector('.carousel-items');
        const items = document.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const itemWidth = items[0].offsetWidth + 15;
        const visibleItems = window.innerWidth >= 1200 ? 3 :
                            window.innerWidth >= 992 ? 2 :
                            window.innerWidth >= 768 ? 1 :
                            window.innerWidth >= 480 ? 1 : 1;
        let maxPosition = -(Math.max(0, items.length - visibleItems) * itemWidth);
        let currentPosition = 0;
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
        itemsContainer.style.transform = `translateX(${currentPosition}px)`;
        rightArrow.addEventListener('click', () => {
          if (currentPosition > maxPosition) {
            currentPosition -= itemWidth;
            currentPosition = Math.max(maxPosition, currentPosition);
            itemsContainer.style.transform = `translateX(${currentPosition}px)`;
          }
        });
        leftArrow.addEventListener('click', () => {
          if (currentPosition < 0) {
            currentPosition += itemWidth;
            currentPosition = Math.min(0, currentPosition);
            itemsContainer.style.transform = `translateX(${currentPosition}px)`;
          }
        });
        window.addEventListener('resize', () => {
          const newVisibleItems = window.innerWidth >= 1200 ? 3 :
                                 window.innerWidth >= 992 ? 2 :
                                 window.innerWidth >= 768 ? 1 :
                                 window.innerWidth >= 480 ? 1 : 1;
          const newItemWidth = items[0].offsetWidth + 15;
          maxPosition = -(Math.max(0, items.length - newVisibleItems) * newItemWidth);
          currentPosition = Math.max(maxPosition, Math.min(0, currentPosition));
          itemsContainer.style.transform = `translateX(${currentPosition}px)`;
        });
        document.querySelectorAll('.heart-icon').forEach(heart => {
          heart.addEventListener('click', (e) => {
            const productId = e.target.closest('.heart-icon').dataset.id;
            let favorites = JSON.parse(localStorage.getItem('customCarouselFavorites') || '[]');
            if (favorites.includes(productId)) {
              favorites = favorites.filter(id => id !== productId);
              e.target.closest('.heart-icon').classList.remove('favorited');
            } else {
              favorites.push(productId);
              e.target.closest('.heart-icon').classList.add('favorited');
            }
            localStorage.setItem('customCarouselFavorites', JSON.stringify(favorites));
          });
        });
        document.querySelectorAll('.add-to-cart-button').forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = e.target.closest('.carousel-item').dataset.id;
            console.log(`Adding product ${productId} to cart`);
          });
        });
      }
    };
    self.init();
  })();
