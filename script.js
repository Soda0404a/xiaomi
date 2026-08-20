document.addEventListener('DOMContentLoaded', function() {
    // 分类导航功能
    const navItems = document.querySelector('.nav-items');
    navItems.querySelectorAll('a').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active类
            navItems.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
            });
            
            // 添加active类到当前点击的项目
            this.classList.add('active');
            
            // 获取分类
            const category = this.getAttribute('data-category');
            
            // 过滤商品
            document.querySelectorAll('.product-card').forEach(product => {
                if (category === 'all') {
                    product.style.display = 'block';
                } else {
                    if (product.getAttribute('data-category') === category) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                }
            });
        });
    });

    // 登录注册相关元素
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // 获取当前用户的购物车数据
    function getCurrentUserCart() {
        const username = localStorage.getItem('username');
        if (!username) return [];
        
        const userCart = localStorage.getItem(`cart_${username}`);
        return userCart ? JSON.parse(userCart) : [];
    }

    // 保存当前用户的购物车数据
    function saveCurrentUserCart(cartData) {
        const username = localStorage.getItem('username');
        if (username) {
            localStorage.setItem(`cart_${username}`, JSON.stringify(cartData));
        }
    }

    // 初始化购物车
    let cart = getCurrentUserCart();
    updateCartDisplay();

    // 购物车相关元素
    const cartBtn = document.querySelector('.fa-shopping-cart').parentElement;
    const cartModal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // 添加购物车数量显示元素
    const cartCount = document.createElement('span');
    cartCount.className = 'cart-count';
    cartCount.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #ff6700;
        color: white;
        border-radius: 50%;
        padding: 2px 6px;
        font-size: 12px;
        min-width: 16px;
        text-align: center;
    `;
    cartBtn.style.position = 'relative';
    cartBtn.appendChild(cartCount);
    updateCartCount();

    // 更新购物车数量显示
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (!cartCount) return;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // 登录按钮点击事件
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    // 注册按钮点击事件
    registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'block';
    });

    // 切换到注册界面
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    // 切换到登录界面
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // 处理登录表单提交
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();
            console.log('登录响应:', data);

            if (response.status === 200 || response.status === 201) {
                // 登录成功
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                
                // 加载该用户的购物车数据
                cart = getCurrentUserCart();
                updateCartDisplay();
                updateCartCount();

                // 隐藏登录模态框
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'none';
                }

                // 隐藏登录和注册按钮
                const loginBtn = document.getElementById('loginBtn');
                const registerBtn = document.getElementById('registerBtn');
                if (loginBtn) loginBtn.style.display = 'none';
                if (registerBtn) registerBtn.style.display = 'none';

                // 更新用户界面 - 显示用户信息和退出按钮
                updateUserInterface(data.username);

                // 显示欢迎消息
                alert('欢迎回来，' + data.username);
            } else {
                // 登录失败
                alert(data.message || '登录失败！');
            }
        } catch (error) {
            console.error('登录错误:', error);
            alert('登录失败，请稍后重试');
        }
    });

    // 处理注册表单提交
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 检查密码是否匹配
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();
            console.log('注册响应数据:', data);

            // 修改这里的判断条件
            if (response.status === 201 || response.status === 200) {
                // 注册成功
                localStorage.setItem('token', data.token);
                alert('注册成功！');
                registerModal.style.display = 'none';
                
                // 可以选择自动填充登录表单
                document.getElementById('loginUsername').value = email;
            } else {
                // 注册失败
                alert(data.message || '注册失败！');
            }
        } catch (error) {
            console.error('注册错误:', error);
            alert('注册失败，请稍后重试');
        }
    });

    // 购物车显示
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        updateCartDisplay();
        cartModal.style.display = 'block';
    });

    // 添加到购物车函数
    function addToCart(product) {
        if (!localStorage.getItem('username')) {
            alert('请先登录后再添加商品到购物车！');
            return;
        }

        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cart.push({...product});
        }
        saveCurrentUserCart(cart);
        updateCartDisplay();
        updateCartCount();
    }

    // 更新购物车显示
    function updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        cartItems.innerHTML = '';
        let total = 0;

        // 只有登录状态才显示购物车内容
        if (localStorage.getItem('username')) {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                cartItems.innerHTML += `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">¥${item.price}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn plus">+</button>
                                <button class="cart-item-remove">删除</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        cartTotal.textContent = `¥${total.toFixed(2)}`;
        addCartItemListeners();
    }

    // 购物车商品的事件监听
    function addCartItemListeners() {
        document.querySelectorAll('.cart-item .minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.cart-item').dataset.id;
                const item = cart.find(item => item.id == id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                    saveCurrentUserCart(cart);
                    updateCartDisplay();
                    updateCartCount();
                }
            });
        });

        document.querySelectorAll('.cart-item .plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.cart-item').dataset.id;
                const item = cart.find(item => item.id == id);
                if (item) {
                    item.quantity++;
                    saveCurrentUserCart(cart);
                    updateCartDisplay();
                    updateCartCount();
                }
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.cart-item').dataset.id;
                cart = cart.filter(item => item.id != id);
                saveCurrentUserCart(cart);
                updateCartDisplay();
                updateCartCount();
            });
        });
    }

    // 结算按钮
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        if (!localStorage.getItem('username')) {
            alert('请先登录！');
            return;
        }
        
        if (cart.length === 0) {
            alert('购物车是空的！');
            return;
        }

        // 显示支付模态框
        showPaymentModal();
    });

    // 显示支付模态框
    function showPaymentModal() {
        const orderItems = document.getElementById('orderItems');
        const orderTotal = document.getElementById('orderTotal');
        let total = 0;

        // 清空之前的订单项
        orderItems.innerHTML = '';

        // 添加订单项
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="item-info">
                    <span>${item.name}</span>
                    <span>x${item.quantity}</span>
                </div>
                <div class="item-price">¥${itemTotal.toFixed(2)}</div>
            `;
            orderItems.appendChild(orderItem);
        });

        // 更新总金额
        orderTotal.textContent = `¥${total.toFixed(2)}`;

        // 显示支付模态框
        paymentModal.style.display = 'block';
        cartModal.style.display = 'none'; // 隐藏购物车模态框
    }

    // 获取模态框元素
    const paymentModal = document.getElementById('paymentModal');
    const qrCodeModal = document.getElementById('qrCodeModal');
    const confirmPaymentBtn = document.getElementById('confirmPayment');

    // 确认支付按钮点击事件
    confirmPaymentBtn.addEventListener('click', function() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        const totalAmount = document.getElementById('orderTotal').textContent;
        
        // 设置二维码图片和标题
        const qrCodeImage = document.getElementById('qrCodeImage');
        const qrCodeTitle = document.getElementById('qrCodeTitle');
        const qrCodeAmount = document.getElementById('qrCodeAmount');
        
        if (selectedPayment === 'alipay') {
            qrCodeImage.src = 'images/alipay_qr.png';
            qrCodeTitle.textContent = '支付宝扫码支付';
        } else {
            qrCodeImage.src = 'images/wechat_qr.png';
            qrCodeTitle.textContent = '微信扫码支付';
        }
        
        qrCodeAmount.textContent = totalAmount;
        
        // 隐藏支付选择模态框，显示二维码模态框
        paymentModal.style.display = 'none';
        qrCodeModal.style.display = 'block';
        
        // 模拟支付过程
        let checkPaymentStatus = setInterval(() => {
            // 模拟用户扫码支付完成
            clearInterval(checkPaymentStatus);
            setTimeout(() => {
                alert('支付成功！');
                qrCodeModal.style.display = 'none';
                
                // 清空购物车
                cart = [];
                saveCurrentUserCart(cart);
                updateCartDisplay();
                updateCartCount();
                
                // 重置按钮状态
                confirmPaymentBtn.textContent = '确认支付';
                confirmPaymentBtn.disabled = false;
            }, 3000); // 假设3秒后支付成功
        }, 1000);
    });

    // 关闭二维码模态框
    qrCodeModal.querySelector('.close').addEventListener('click', function() {
        qrCodeModal.style.display = 'none';
        confirmPaymentBtn.textContent = '确认支付';
        confirmPaymentBtn.disabled = false;
    });

    // 关闭支付模态框
    paymentModal.querySelector('.close').addEventListener('click', function() {
        paymentModal.style.display = 'none';
        confirmPaymentBtn.textContent = '确认支付';
        confirmPaymentBtn.disabled = false;
    });

    // 关闭按钮功能
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // 商品卡片点击事件（直接购买按钮）
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const card = this.closest('.product-card');
            const product = {
                id: Date.now(),
                image: card.querySelector('img').src,
                name: card.querySelector('h3').textContent,
                price: parseFloat(card.querySelector('.price').textContent.replace('¥', '')),
                quantity: 1
            };
            addToCart(product);
            alert('已添加到购物车！');
        });
    });

    // 轮播图功能
    const slides = document.querySelectorAll('.slider img');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        slides.forEach(slide => {
            slide.style.opacity = 0;
            slide.classList.remove('active');
        });
        slides[index].style.opacity = 1;
        slides[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % 3;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + 3) % 3;
        showSlide(currentSlide);
    }

    // 开始自动轮播
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 3000);
    }

    // 停止自动轮播
    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    // 按钮点击事件
    nextBtn.addEventListener('click', () => {
        stopSlideShow();
        nextSlide();
        startSlideShow();
    });

    prevBtn.addEventListener('click', () => {
        stopSlideShow();
        prevSlide();
        startSlideShow();
    });

    // 鼠标悬停时停止轮播
    document.querySelector('.slider').addEventListener('mouseenter', stopSlideShow);
    document.querySelector('.slider').addEventListener('mouseleave', startSlideShow);
    
    // 初始显示第一张图片并开始轮播
    showSlide(currentSlide);
    startSlideShow();

    // 更新用户界面函数
    function updateUserInterface(username) {
        // 首先检查并隐藏登录注册按钮
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';

        // 获取导航栏右侧区域
        const rightNav = document.querySelector('.right-nav');
        if (!rightNav) {
            console.error('找不到导航栏右侧元素');
            return;
        }

        // 清除之前的用户信息（如果有）
        const existingUserInfo = document.querySelector('.user-info-container');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }

        // 创建用户信息容器
        const userInfoContainer = document.createElement('div');
        userInfoContainer.className = 'user-info-container';
        userInfoContainer.style.cssText = `
            display: inline-flex;
            align-items: center;
            margin-right: 20px;
        `;

        // 用户名显示
        const userInfo = document.createElement('span');
        userInfo.textContent = `欢迎，${username}`;
        userInfo.style.cssText = `
            color: #333;
            margin-right: 10px;
        `;

        // 退出按钮
        const logoutBtn = document.createElement('a');
        logoutBtn.textContent = '退出';
        logoutBtn.href = '#';
        logoutBtn.style.cssText = `
            color: #333;
            text-decoration: none;
            padding: 4px 8px;
            border: 1px solid #ff6700;
            border-radius: 4px;
            margin-right: 15px;
        `;

        // 添加退出按钮点击事件
        logoutBtn.addEventListener('click', handleLogout);

        // 组装用户信息区域
        userInfoContainer.appendChild(userInfo);
        userInfoContainer.appendChild(logoutBtn);

        // 获取购物车链接
        const cartLink = rightNav.querySelector('.fa-shopping-cart').parentElement;

        // 插入到购物车链接前面
        rightNav.insertBefore(userInfoContainer, cartLink);
    }

    // 页面加载时检查登录状态
    document.addEventListener('DOMContentLoaded', function() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        
        if (token && username) {
            // 已登录状态
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('registerBtn').style.display = 'none';
            
            // 更新用户界面
            updateUserInterface(username);
        }
    });

    // 修改退出登录的处理
    function handleLogout() {
        const username = localStorage.getItem('username');
        
        // 清除用户相关信息
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        
        // 清空当前购物车显示
        cart = [];
        updateCartDisplay();
        updateCartCount();
        
        // 恢复登录和注册按钮
        document.getElementById('loginBtn').style.display = 'inline-block';
        document.getElementById('registerBtn').style.display = 'inline-block';
        
        // 移除用户信息显示
        const userInfoContainer = document.querySelector('.user-info-container');
        if (userInfoContainer) {
            userInfoContainer.remove();
        }
        
        alert('已成功退出登录！');
    }
}); 