(function() {
    const self = {
      init: () => {
        if (window.location.pathname !== '/') {
          console.log('wrong page');
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
          <div class="custom-carousel">
            <h2 class="carousel-title">Beğenebileceğinizi Düşündüklerimiz</h2>
            <div class="carousel-container">
              <button class="carousel-arrow left-arrow">&lt;</button>
              <div class="carousel-items">
                ${products.map(product => {
                  const price = parseFloat(product.price);
                  const originalPrice = parseFloat(product.original_price);
                  const hasDiscount = Math.abs(price - originalPrice) > 0.01; 
                  const discountLabel = product.discount_label || '';
                  const isBestseller = product.bestseller || false;
                  
                  return `
                    <div class="carousel-item" data-id="${product.id}">
                      ${isBestseller ? `<div class="bestseller-badge">ÇOK SATAN</div>` : ''}
                      ${discountLabel ? `<div class="discount-label">${discountLabel}</div>` : ''}
                      <a href="${product.url}" target="_blank" class="product-link">
                        <div class="product-image-container">
                          <img src="${product.img}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found';">
                        </div>
                        <div class="product-info">
                          <span class="product-name">${product.name}</span>
                          <div class="rating-container">
                            ${'★'.repeat(5)} <span class="review-count">(${product.review_count || 0})</span>
                          </div>
                          ${hasDiscount ? `
                            <span class="original-price">${originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                            <span class="current-price">${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                            <span class="discount-amount">%${Math.round(((originalPrice - price) / originalPrice) * 100)}</span>
                          ` : `
                            <span class="current-price">${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                          `}
                        </div>
                      </a>
                      <div class="heart-icon ${favorites.includes(product.id) ? 'favorited' : ''}" data-id="${product.id}">♡</div>
                      <button class="add-to-cart-button">Sepete Ekle</button>
                    </div>
                  `;
                }).join('')}
              </div>
              <button class="carousel-arrow right-arrow">&gt;</button>
            </div>
          </div>
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
          console.warn('Target section not found, appending to body');
          document.body.insertAdjacentHTML('beforeend', carouselHtml);
        }
      },
  
      buildCSS: () => {
        const css = `
          .custom-carousel {
            max-width: 1200px;
            margin: 30px auto;
            font-family: 'Open Sans', sans-serif;
            padding: 0 15px;
            box-sizing: border-box;
          }
          .carousel-title {
            font-size: 24px;
            font-weight: 600;
            color: #F5821F;
            margin-bottom: 20px;
            text-align: left;
            background-color: #FEF7EC;
            padding: 15px;
            border-radius: 5px;
          }
          .carousel-container {
            position: relative;
            overflow: hidden;
            padding: 0 30px;
          }
          .carousel-items {
            display: flex;
            transition: transform 0.5s ease;
            gap: 15px;
          }
          .carousel-item {
            flex: 0 0 calc(20% - 12px);
            box-sizing: border-box;
            position: relative;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
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
            height: 180px;
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
          }
          .product-info {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .product-name {
            font-size: 14px;
            color: #333;
            display: block;
            height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 8px;
            line-height: 1.4;
          }
          .rating-container {
            color: #FFA500;
            font-size: 12px;
            margin-bottom: 8px;
          }
          .review-count {
            color: #757575;
            margin-left: 3px;
          }
          .original-price {
            text-decoration: line-through;
            color: #747881;
            font-size: 14px;
          }
          .current-price {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin-top: 5px;
          }
          .discount-amount {
            font-size: 14px;
            color: #5dac06;
            font-weight: bold;
            background-color: #e8f4e5;
            padding: 2px 5px;
            border-radius: 3px;
            display: inline-block;
            margin-left: 5px;
          }
          .bestseller-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: #F5821F;
            color: white;
            font-size: 12px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 5px;
            z-index: 2;
          }
          .discount-label {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: #5dac06;
            color: white;
            font-size: 12px;
            padding: 3px 6px;
            border-radius: 3px;
            z-index: 1;
          }
          .heart-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            color: #d3d6db;
            cursor: pointer;
            z-index: 1;
            transition: color 0.3s ease;
          }
          .heart-icon.favorited {
            color: #ff9800;
          }
          .add-to-cart-button {
            background-color: #FFA500;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            font-size: 14px;
            cursor: pointer;
            margin-top: 10px;
            transition: background-color 0.3s ease;
            width: 100%;
          }
          .add-to-cart-button:hover {
            background-color: #FF8C00;
          }
          .carousel-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: #fff;
            border: 1px solid #d3d6db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 18px;
            cursor: pointer;
            z-index: 1;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .carousel-arrow:hover {
            background-color: #f5f5f5;
            border-color: #bbb;
          }
          .left-arrow { left: 0; }
          .right-arrow { right: 0; }
          @media (max-width: 1100px) {
            .carousel-item { flex: 0 0 calc(25% - 12px); }
          }
          @media (max-width: 900px) {
            .carousel-item { flex: 0 0 calc(33.33% - 10px); }
          }
          @media (max-width: 600px) {
            .carousel-item { flex: 0 0 calc(50% - 8px); }
          }
          @media (max-width: 480px) {
            .carousel-item { flex: 0 0 100%; }
          }
        `;
        const style = document.createElement('style');
        style.className = 'carousel-style';
        style.textContent = css;
        document.head.appendChild(style);
      },
  
      setEvents: (products) => {
        const itemsContainer = document.querySelector('.carousel-items');
        const items = document.querySelectorAll('.carousel-item');
        
        if (!items.length) return;
        
        const itemWidth = items[0].offsetWidth + 15; 
        const visibleItems = window.innerWidth >= 1100 ? 5 : 
                            window.innerWidth >= 900 ? 4 : 
                            window.innerWidth >= 600 ? 3 : 
                            window.innerWidth >= 480 ? 2 : 1;
        
        let currentPosition = 0;
        let maxPosition = -(Math.max(0, items.length - visibleItems)) * itemWidth;
  
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
  
        const updateArrows = () => {
          leftArrow.style.opacity = currentPosition < 0 ? '1' : '0.5';
          rightArrow.style.opacity = currentPosition > maxPosition ? '1' : '0.5';
        };
  
        updateArrows();
  
        rightArrow.addEventListener('click', () => {
          if (currentPosition > maxPosition) {
            currentPosition = Math.max(maxPosition, currentPosition - (itemWidth * visibleItems));
            itemsContainer.style.transform = `translateX(${currentPosition}px)`;
            updateArrows();
          }
        });
  
        leftArrow.addEventListener('click', () => {
          if (currentPosition < 0) {
            currentPosition = Math.min(0, currentPosition + (itemWidth * visibleItems));
            itemsContainer.style.transform = `translateX(${currentPosition}px)`;
            updateArrows();
          }
        });
  
        window.addEventListener('resize', () => {
          const newVisibleItems = window.innerWidth >= 1100 ? 5 : 
                                 window.innerWidth >= 900 ? 4 : 
                                 window.innerWidth >= 600 ? 3 : 
                                 window.innerWidth >= 480 ? 2 : 1;
          
          const newItemWidth = items[0].offsetWidth + 15;
          maxPosition = -(Math.max(0, items.length - newVisibleItems)) * newItemWidth;
          
          if (currentPosition < maxPosition) {
            currentPosition = maxPosition;
          }
          
          itemsContainer.style.transform = `translateX(${currentPosition}px)`;
          updateArrows();
        });
  
        document.querySelectorAll('.heart-icon').forEach(heart => {
          heart.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            let favorites = JSON.parse(localStorage.getItem('customCarouselFavorites') || '[]');
            
            if (favorites.includes(productId)) {
              favorites = favorites.filter(id => id !== productId);
              e.target.classList.remove('favorited');
            } else {
              favorites.push(productId);
              e.target.classList.add('favorited');
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
