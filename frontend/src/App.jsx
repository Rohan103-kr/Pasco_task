import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Search, Menu, X, ChevronRight, ChevronLeft, Info, Phone, Mail, MapPin,
  Sparkles, RotateCcw, Check, Flame, ArrowRight, ArrowLeft,
  Globe, Shield, Award, Send, ShoppingCart, Plus, Minus, Trash2,
  CheckCircle, ShoppingBag, Clock, Store, User, Lock, LogOut, Key,
  UserPlus, ShieldCheck, Utensils, Calendar, Ticket, CreditCard, QrCode, Wallet
} from 'lucide-react';
import './App.css';

// Nearby Pasco Store & Pickup Depot Locations (Dummy Data)
const nearbyStores = [
  {
    id: 'wigan-hq',
    name: 'Pasco Foods Factory Shop (Wigan HQ)',
    address: 'Pasco House, Pepper Mill Way',
    city: 'Wigan',
    postcode: 'WN3 4AL',
    distance: '0.2 miles (HQ)',
    hours: 'Mon-Sat: 8:00 AM - 6:00 PM',
    phone: '01942 493220'
  },
  {
    id: 'manchester-hub',
    name: 'Pasco Manchester Trade Depot',
    address: 'Unit 4, Trafford Park Estate',
    city: 'Manchester',
    postcode: 'M17 1EH',
    distance: '18 miles',
    hours: 'Mon-Sat: 8:30 AM - 5:30 PM',
    phone: '0161 872 9900'
  },
  {
    id: 'liverpool-store',
    name: 'Pasco Liverpool Regional Hub',
    address: '12 Baltic Triangle, Jamaica St',
    city: 'Liverpool',
    postcode: 'L1 0AB',
    distance: '24 miles',
    hours: 'Mon-Sat: 9:00 AM - 5:00 PM',
    phone: '0151 709 4433'
  },
  {
    id: 'birmingham-depot',
    name: 'Pasco Midlands Trade Store',
    address: '88 Digbeth High Street',
    city: 'Birmingham',
    postcode: 'B5 6DY',
    distance: '85 miles',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    phone: '0121 643 1122'
  },
  {
    id: 'london-depot',
    name: 'Pasco London Spice & Foodservice Depot',
    address: 'Park Royal Industrial Estate',
    city: 'London',
    postcode: 'NW10 7PQ',
    distance: '195 miles',
    hours: 'Mon-Sat: 8:00 AM - 6:00 PM',
    phone: '0208 965 7788'
  }
];

const availableTimeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM'
];

const tastingTimeSlots = [
  '10:00 AM - 10:30 AM',
  '11:30 AM - 12:00 PM',
  '02:00 PM - 02:30 PM',
  '04:00 PM - 04:30 PM',
  '05:30 PM - 06:00 PM'
];

function App() {
  // User Authentication states
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pasco_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    customerType: 'Retail Consumer'
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Taste Slot Booking states
  const [tastingModalProduct, setTastingModalProduct] = useState(null);
  const [tastingFormData, setTastingFormData] = useState({
    selectedStoreId: 'wigan-hq',
    tastingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tastingTimeSlot: '11:30 AM - 12:00 PM',
    partySize: 2,
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone : ''
  });
  const [tastingSubmitting, setTastingSubmitting] = useState(false);
  const [completedTastingBooking, setCompletedTastingBooking] = useState(null);

  const openTastingModal = (product, e) => {
    if (e) e.stopPropagation();
    setTastingModalProduct(product);
    setTastingFormData({
      selectedStoreId: 'wigan-hq',
      tastingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      tastingTimeSlot: '11:30 AM - 12:00 PM',
      partySize: 2,
      name: user ? user.name : '',
      email: user ? user.email : '',
      phone: user ? user.phone : ''
    });
  };

  const handleTastingSubmit = async (e) => {
    e.preventDefault();
    if (!tastingModalProduct) return;
    setTastingSubmitting(true);

    const selectedStore = nearbyStores.find((s) => s.id === tastingFormData.selectedStoreId) || nearbyStores[0];

    const payload = {
      productCode: tastingModalProduct.productCode,
      productName: tastingModalProduct.name,
      productImage: tastingModalProduct.image,
      store: selectedStore,
      tastingDate: tastingFormData.tastingDate,
      tastingTimeSlot: tastingFormData.tastingTimeSlot,
      partySize: tastingFormData.partySize,
      customer: {
        name: tastingFormData.name,
        email: tastingFormData.email,
        phone: tastingFormData.phone
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/tastings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setCompletedTastingBooking(data.booking);
        setTastingModalProduct(null);
      }
    } catch (err) {
      console.error('Error booking tasting:', err);
      const fallbackBooking = {
        bookingReference: `PASCO-TASTE-${Math.floor(10000 + Math.random() * 90000)}`,
        ...payload,
        createdAt: new Date().toISOString()
      };
      setCompletedTastingBooking(fallbackBooking);
      setTastingModalProduct(null);
    } finally {
      setTastingSubmitting(false);
    }
  };

  // Products states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected product for modal detail view
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('info'); // 'info' or 'recipe'
  const [jarFlipped, setJarFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});

  // Filter states
  const [activeRange, setActiveRange] = useState('retail'); // 'retail' or 'foodservice'
  const [activeRangeType, setActiveRangeType] = useState('All'); // 'All' or specific range name
  const [spicinessFilter, setSpicinessFilter] = useState('All'); // 'All', 'none', 'mild', 'medium', 'hot', 'very hot'
  const [selectedDietary, setSelectedDietary] = useState([]); // Array of tags e.g. ['Vegetarian']
  const [searchTerm, setSearchTerm] = useState('');

  // Layout states
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  // Dynamic Hero Product Carousel Slides (Discounted & Featured Products)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const heroSlides = [
    {
      id: 'slide-10-for-10',
      tag: '🔥 SPECIAL OFFER — SAVE 60%',
      title: 'Authentic Pasco Special Offers',
      titleAccent: '10 Jars for £10',
      desc: 'Mix & Match 10 selected Pasco cooking sauces, pastes, and pickles for just £10! UK delivery or free Wigan factory shop pickup.',
      badge: '10 FOR £10 OFFER',
      badgeColor: '#B68923',
      image: '/assets/pasco-slider-10-for-10.jpg',
      primaryCtaText: 'Shop £10 Offer',
      primaryCtaHref: '#bundles',
      secondaryCtaText: 'View Catalog',
      secondaryCtaHref: '#catalog',
      onPrimaryClick: () => {
        const el = document.getElementById('bundles');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'slide-sauces',
      tag: '⭐ TOP RATED — 20% OFF CASES',
      title: 'Authentic Indian Cooking Sauces',
      titleAccent: 'Crafted for Chef & Home',
      desc: 'Rich Tikka Masala, Butter Chicken, Jalfrezi, Korma & Vindaloo. 100% natural, additive & preservative free.',
      badge: 'SAVE 20% ON RETAIL CASES',
      badgeColor: '#8E1C15',
      image: '/assets/hero_dish.png',
      primaryCtaText: 'Browse Cooking Sauces',
      primaryCtaHref: '#catalog',
      secondaryCtaText: 'Explore Recipes',
      secondaryCtaHref: '#recipes',
      onPrimaryClick: () => {
        setActiveRange('retail');
        setActiveRangeType('Cooking Sauces');
        const el = document.getElementById('catalog');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'slide-pastes',
      tag: '🌿 SECRET FAMILY RECIPES — BUY 2 GET 1 FREE',
      title: 'Tandoori, Tikka & Kebab Pastes',
      titleAccent: 'Cultivated in India',
      desc: 'Slow-cooked spice marinades grown on our own farm plantations in India. Perfect base for roasting, grilling & barbecues.',
      badge: 'BUY 2 GET 1 FREE',
      badgeColor: '#15803D',
      image: '/assets/pasco-slider-5.jpg',
      primaryCtaText: 'Explore Cooking Pastes',
      primaryCtaHref: '#catalog',
      secondaryCtaText: 'Spice Finder',
      secondaryCtaHref: '#finder',
      onPrimaryClick: () => {
        setActiveRange('retail');
        setActiveRangeType('Cooking Pastes');
        const el = document.getElementById('catalog');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'slide-pickles',
      tag: '🥭 TASTE OF INDIA — SPECIAL BUNDLES',
      title: 'Authentic Pickles & Chutneys',
      titleAccent: 'Tickle the Pickle',
      desc: 'Handcrafted Mango, Lime, Chilli & Garlic pickles paired with Sweet Mango Chutneys using fresh fruit & heritage spices.',
      badge: 'SPECIAL £8.99 4-PACK',
      badgeColor: '#D97706',
      image: '/assets/Chutneys-Slider.jpg',
      primaryCtaText: 'Shop Pickles & Chutneys',
      primaryCtaHref: '#catalog',
      secondaryCtaText: 'Customer Reviews',
      secondaryCtaHref: '#reviews',
      onPrimaryClick: () => {
        setActiveRange('retail');
        setActiveRangeType('Pickles & Chutneys');
        const el = document.getElementById('catalog');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % 4);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + 4) % 4);
  };

  // DEFRA Factory Tour Lightbox state
  const [defraLightboxImg, setDefraLightboxImg] = useState(null);

  // Print Official Purchase Order Invoice Helper
  const handlePrintPO = (order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Pasco Foods Limited - Purchase Order #${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1C1917; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #8E1C15; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 800; color: #8E1C15; letter-spacing: 0.5px; }
            .meta { font-size: 13px; color: #555; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #FAF6EE; color: #8E1C15; font-weight: 700; text-transform: uppercase; font-size: 12px; }
            .total { font-weight: 800; text-align: right; margin-top: 24px; font-size: 20px; color: #8E1C15; border-top: 2px solid #8E1C15; padding-top: 12px; }
            .footer { margin-top: 50px; border-top: 1px solid #CBD5E1; padding-top: 16px; font-size: 12px; color: #64748B; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">PASCO FOODS LIMITED</div>
              <div class="meta">Pasco House, Makerfield Way, Ince-in-Makerfield, Wigan WN2 2PR</div>
              <div class="meta">Tel: 01942 493220 | Email: sales@pascofoods.com | Web: www.pascofoods.co.uk</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 800; color: #B68923;">PURCHASE ORDER</div>
              <div class="meta"><strong>PO #:</strong> ${order.orderNumber}</div>
              <div class="meta"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div style="background: #FAF6EE; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px 0; color: #8E1C15;">Customer / Trade Details</h4>
            <div style="font-size: 14px; line-height: 1.6;">
              <strong>Contact:</strong> ${order.customer.name} | <strong>Email:</strong> ${order.customer.email}<br/>
              <strong>Phone:</strong> ${order.customer.phone} | <strong>Account Type:</strong> ${order.customer.customerType}<br/>
              <strong>Fulfillment:</strong> ${order.customer.deliveryMethod}
            </div>
          </div>
          <h3>Submitted Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Item Name</th>
                <th>Size</th>
                <th style="text-align: center;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td><strong>${item.productCode}</strong></td>
                  <td>${item.name}</td>
                  <td>${item.size}</td>
                  <td style="text-align: center;"><strong>${item.quantity}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total Order Value: £${(order.totalAmount || 0).toFixed(2)}</div>
          <div class="footer">
            Official Purchase Order generated via Pasco Foods Limited E-Commerce Platform. SALSA & BRC Global Accredited.
          </div>
          <script>setTimeout(function(){ window.print(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Shopping Cart & Order Checkout states
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pasco_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    customerType: user ? user.customerType : 'Retail Consumer',
    deliveryMethod: 'Store Takeout / Pickup',
    selectedStoreId: 'wigan-hq',
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickupTimeSlot: '11:00 AM - 01:00 PM',
    address: '',
    city: '',
    postcode: '',
    notes: ''
  });

  // Auto pre-fill checkout data when user changes
  useEffect(() => {
    if (user) {
      setCheckoutData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        customerType: user.customerType || prev.customerType
      }));
    }
  }, [user]);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authFormData.email, password: authFormData.password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pasco_token', data.token);
        localStorage.setItem('pasco_user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthModalOpen(false);
      } else {
        setAuthError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError('Connection error logging in.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authFormData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pasco_token', data.token);
        localStorage.setItem('pasco_user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthModalOpen(false);
      } else {
        setAuthError(data.message || 'Failed to create account.');
      }
    } catch (err) {
      setAuthError('Connection error creating account.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const quickLoginAs = (email, password) => {
    setAuthFormData({ ...authFormData, email, password });
    setAuthError(null);
    setAuthSubmitting(true);
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem('pasco_token', data.token);
          localStorage.setItem('pasco_user', JSON.stringify(data.user));
          setUser(data.user);
          setAuthModalOpen(false);
        } else {
          setAuthError(data.message);
        }
      })
      .catch(() => setAuthError('Failed to quick login'))
      .finally(() => setAuthSubmitting(false));
  };

  const handleLogout = () => {
    localStorage.removeItem('pasco_token');
    localStorage.removeItem('pasco_user');
    setUser(null);
    setUserDropdownOpen(false);
  };
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Payment Gateway & Razorpay Modal States
  const [paymentMethod, setPaymentMethod] = useState('Razorpay Secure Gateway');
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState('card');
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '4532 8912 3456 7890',
    name: user ? user.name : 'John Smith',
    expiry: '08/28',
    cvv: '888'
  });
  const [upiId, setUpiId] = useState(user ? `${user.name.toLowerCase().replace(/\s+/g, '')}@upi` : 'johnsmith@upi');

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pasco_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const getItemPrice = (product) => {
    if (product.price) return product.price;
    if (product.rangeType === 'Bundle') return 14.99;
    if (product.category === 'Foodservice') return 12.50;
    return 3.50;
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + getItemPrice(item.product) * item.quantity, 0);
  const deliveryFee = checkoutData.deliveryMethod === 'Store Takeout / Pickup' ? 0 : 3.99;
  const cartTotalAmount = Math.max(0, cartSubtotal + deliveryFee);

  const addToCart = (product, qty = 1, e) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.productCode === product.productCode);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const updateCartQuantity = (productCode, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.productCode === productCode) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productCode) => {
    setCart((prev) => prev.filter((item) => item.product.productCode !== productCode));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = async (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'Razorpay Secure Gateway' || paymentMethod === 'Razorpay UPI / QR') {
      setRazorpayModalOpen(true);
    } else {
      await executeOrderSubmission({
        pMethod: paymentMethod,
        pStatus: paymentMethod === 'Pay at Pickup Counter' ? 'Pending Counter Payment' : 'Trade Credit Pending',
        pTxnId: paymentMethod === 'Pay at Pickup Counter' ? 'PAY-COUNTER-COLLECT' : 'BACS-TRADE-CREDIT'
      });
    }
  };

  const processRazorpayPayment = async () => {
    setRazorpayProcessing(true);
    const txnId = `pay_rzp_${Math.floor(100000000 + Math.random() * 900000000)}`;

    setTimeout(async () => {
      setRazorpayProcessing(false);
      setRazorpayModalOpen(false);
      await executeOrderSubmission({
        pMethod: paymentMethod === 'Razorpay UPI / QR' ? 'Razorpay Instant UPI' : 'Razorpay Secure Gateway',
        pStatus: 'Paid via Razorpay',
        pTxnId: txnId
      });
    }, 1200);
  };

  const executeOrderSubmission = async ({ pMethod, pStatus, pTxnId }) => {
    setCheckoutSubmitting(true);
    const selectedStore = nearbyStores.find((s) => s.id === checkoutData.selectedStoreId) || nearbyStores[0];

    const customerPayload = {
      ...checkoutData,
      pickupStore: checkoutData.deliveryMethod === 'Store Takeout / Pickup' ? selectedStore : null
    };

    try {
      const orderPayload = {
        customer: customerPayload,
        items: cart.map((item) => ({
          productCode: item.product.productCode,
          name: item.product.name,
          size: item.product.size,
          category: item.product.category,
          rangeType: item.product.rangeType,
          unitBarcode: item.product.unitBarcode,
          quantity: item.quantity
        })),
        totalAmount: parseFloat(cartTotalAmount.toFixed(2)),
        paymentMethod: pMethod,
        paymentStatus: pStatus,
        paymentTransactionId: pTxnId
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (data.success) {
        setCompletedOrder(data.order);
        clearCart();
        setCheckoutOpen(false);
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      const fallbackOrder = {
        orderNumber: `PASCO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        customer: customerPayload,
        items: cart.map((i) => ({ ...i.product, quantity: i.quantity })),
        totalItems: totalCartItems,
        totalAmount: parseFloat(cartTotalAmount.toFixed(2)),
        paymentMethod: pMethod,
        paymentStatus: pStatus,
        paymentTransactionId: pTxnId,
        createdAt: new Date().toISOString()
      };
      setCompletedOrder(fallbackOrder);
      clearCart();
      setCheckoutOpen(false);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Interactive Spice Finder Wizard states
  const [finderStep, setFinderStep] = useState(0); // 0: Start, 1: Spice level, 2: Cuisine style, 3: Protein/Veggie, 4: Results
  const [finderSelections, setFinderSelections] = useState({
    spiciness: '',
    cuisine: '',
    protein: ''
  });
  const [finderRecommendations, setFinderRecommendations] = useState([]);

  // Contact Form states
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formSubmitStatus, setFormSubmitStatus] = useState(null); // { success: true/false, message: '' }
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Assignment & Architecture Showcase modal state
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 Welcome to Pasco Foods. I am your AI assistant. Ask me anything about our authentic Indian sauces, pastes, chutneys, or pickles!'
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll chat window to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading, chatOpen]);

  // Submit/Send chatbot messages to API
  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || chatInput;
    if (!msg.trim()) return;

    // Add user message
    const newMessages = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    try {
      // Build history for backend (limit to last 10 messages)
      const history = newMessages
        .slice(-11, -1)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history
        })
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I had trouble communicating with my recipe brain. Please check that the local Ollama instance or backend environment is running properly.'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Monitor scroll to trigger sticky header styling & update active section indicator
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = ['about', 'craftsmanship', 'catalog', 'bundles', 'recipes', 'reviews', 'finder', 'contact'];
      let current = 'home';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showMobileMenu]);

  // Close 'More' dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // We use query parameter mapping or fetch all and filter client side
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Could not fetch catalog data');
        }
        const data = await response.json();
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load product data from the server. Running with static backup catalog.');
        // Set offline static catalog as fallback in case server is not running
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter logic runs client-side whenever products list or filter parameters change
  useEffect(() => {
    let result = [...products];

    // 1. Filter by category (retail vs foodservice)
    result = result.filter(p => p.category === activeRange);

    // 2. Filter by range type (Cooking Sauces, Cooking Pastes, Al Rifai Range, etc.)
    if (activeRangeType !== 'All') {
      result = result.filter(p => p.rangeType === activeRangeType);
    }

    // 3. Filter by spiciness
    if (spicinessFilter !== 'All') {
      result = result.filter(p => p.spiciness === spicinessFilter);
    }

    // 4. Filter by dietary tags
    if (selectedDietary.length > 0) {
      result = result.filter(p =>
        selectedDietary.every(d => (p.dietary || []).includes(d))
      );
    }

    // 5. Filter by search term (name or description)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.productCode || '').toLowerCase().includes(term)
      );
    }

    setFilteredProducts(result);
  }, [products, activeRange, activeRangeType, spicinessFilter, selectedDietary, searchTerm]);

  // Reset range type filter when category swaps
  const handleRangeChange = (range) => {
    setActiveRange(range);
    setActiveRangeType('All');
  };

  // Toggle dietary selections
  const handleDietaryToggle = (diet) => {
    if (selectedDietary.includes(diet)) {
      setSelectedDietary(selectedDietary.filter(d => d !== diet));
    } else {
      setSelectedDietary([...selectedDietary, diet]);
    }
  };

  // Form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactData({ ...contactData, [name]: value });
  };

  // Contact Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      setFormSubmitStatus({ success: false, message: 'Please fill in all required fields.' });
      return;
    }

    setFormSubmitting(true);
    setFormSubmitStatus(null);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      const result = await response.json();

      if (response.ok) {
        setFormSubmitStatus({ success: true, message: 'Thank you! Your message has been sent successfully.' });
        setContactData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setFormSubmitStatus({ success: false, message: result.error || 'Failed to submit form.' });
      }
    } catch (err) {
      console.error(err);
      // Fallback submission logic (mocking success in offline client mode)
      setFormSubmitStatus({
        success: true,
        message: 'Form submitted successfully! (Offline local storage simulation mode).'
      });
      setContactData({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Spice Finder Step selections
  const handleFinderSelect = (field, value) => {
    setFinderSelections({ ...finderSelections, [field]: value });
  };

  // Calculate Recommendations
  const calculateRecommendations = () => {
    const { spiciness, cuisine } = finderSelections;

    // Filter overall catalog
    let matches = products.filter(p => {
      // Heat level mapping
      let heatMatch = false;
      if (spiciness === 'mild') heatMatch = p.spiciness === 'mild' || p.spiciness === 'none';
      else if (spiciness === 'medium') heatMatch = p.spiciness === 'medium';
      else if (spiciness === 'hot') heatMatch = p.spiciness === 'hot';
      else if (spiciness === 'very_hot') heatMatch = p.spiciness === 'very hot';

      // Cuisine style mapping
      let rangeMatch = false;
      if (cuisine === 'indian') rangeMatch = p.rangeType === 'Cooking Sauces' || p.rangeType === 'Cooking Pastes';
      else if (cuisine === 'moroccan') rangeMatch = p.rangeType === 'Al Rifai Range';
      else if (cuisine === 'chinese') rangeMatch = p.rangeType === 'Yellow River Range';
      else if (cuisine === 'italian') rangeMatch = p.rangeType === 'Pasta Roma Range';

      return heatMatch && rangeMatch;
    });

    // If no perfect matches, fall back to matching by range type
    if (matches.length === 0) {
      matches = products.filter(p => {
        if (cuisine === 'indian') return p.rangeType === 'Cooking Sauces' || p.rangeType === 'Cooking Pastes';
        if (cuisine === 'moroccan') return p.rangeType === 'Al Rifai Range';
        if (cuisine === 'chinese') return p.rangeType === 'Yellow River Range';
        if (cuisine === 'italian') return p.rangeType === 'Pasta Roma Range';
        return false;
      }).slice(0, 3);
    }

    setFinderRecommendations(matches.slice(0, 3));
    setFinderStep(4);
  };

  // Reset Spice Finder wizard
  const resetFinder = () => {
    setFinderSelections({ spiciness: '', cuisine: '', protein: '' });
    setFinderRecommendations([]);
    setFinderStep(0);
  };

  // List of distinct Range types based on current category tab
  const retailRangeTypes = [
    'Cooking Sauces', 'Cooking Pastes', 'Pickles & Chutneys', 'Condiments',
    'Pasta Roma Range', 'Al Rifai Range', 'Yellow River Range'
  ];

  const foodserviceRangeTypes = [
    'Cooking Pastes', 'Cooking Sauces', 'Pickles & Chutneys', 'Condiments', 'NYC Range'
  ];

  const activeRangesList = activeRange === 'retail' ? retailRangeTypes : foodserviceRangeTypes;

  // Heat Spectrum Slider Helpers
  const getSliderValue = (filter) => {
    switch (filter) {
      case 'All': return 0;
      case 'none': return 1;
      case 'mild': return 2;
      case 'medium': return 3;
      case 'hot': return 4;
      case 'very hot': return 5;
      default: return 0;
    }
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    const filters = ['All', 'none', 'mild', 'medium', 'hot', 'very hot'];
    setSpicinessFilter(filters[val]);
  };

  const getHeatBackground = (filter) => {
    switch (filter) {
      case 'none': return 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)';
      case 'mild': return 'linear-gradient(135deg, rgba(254,243,199,0.3) 0%, rgba(255,255,255,0.9) 100%)';
      case 'medium': return 'linear-gradient(135deg, rgba(255,237,213,0.3) 0%, rgba(255,255,255,0.9) 100%)';
      case 'hot': return 'linear-gradient(135deg, rgba(254,226,226,0.3) 0%, rgba(255,255,255,0.9) 100%)';
      case 'very hot': return 'linear-gradient(135deg, rgba(248,113,113,0.15) 0%, rgba(255,255,255,0.9) 100%)';
      default: return 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,246,238,0.95) 100%)';
    }
  };

  const getHeatName = (filter) => {
    switch (filter) {
      case 'All': return '✨ All Spice Levels';
      case 'none': return '🍲 No Heat / Mild Herb';
      case 'mild': return '🌶️ Mild & Gentle';
      case 'medium': return '🌶️🌶️ Medium Warmth';
      case 'hot': return '🌶️🌶️🌶️ Authentic Hot';
      case 'very hot': return '🌶️🌶️🌶️🌶️ Extreme Vindaloo!';
      default: return '✨ All Spice Levels';
    }
  };

  // Recipe Matching Data Engine
  const getProductRecipe = (p) => {
    if (!p) return null;
    const name = p.name.toLowerCase();

    if (name.includes('tikka masala') || name.includes('butter chicken')) {
      return {
        title: "Mamma's Authentic Punjabi Curry",
        prep: "15 min",
        cook: "20 min",
        servings: "4",
        ingredients: [
          "500g Diced Chicken (or Paneer cubes for vegetarian)",
          "3 tablespoons ghee or unsalted butter",
          "1 jar Pasco Cooking Sauce / 4 tbsp Pasco Paste",
          "100ml heavy cream or coconut milk",
          "Fresh coriander leaves for garnish",
          "1 onion, finely sliced"
        ],
        steps: [
          "Sauté: Heat ghee in a large pan over medium heat. Sauté sliced onions until golden brown.",
          "Sear: Add the diced chicken or paneer, and cook for 5 minutes until lightly seared on all sides.",
          "Simmer: Pour in the Pasco Cooking Sauce (or stir in the Paste with 100ml water and cream). Cover and simmer on low heat for 12-15 minutes until fully cooked.",
          "Garnish: Drizzle with remaining heavy cream and scatter fresh coriander leaves. Serve hot with buttery garlic naan."
        ]
      };
    }

    if (name.includes('vindaloo')) {
      return {
        title: "Traditional Fiery Goan Vindaloo",
        prep: "20 min",
        cook: "30 min",
        servings: "4",
        ingredients: [
          "600g Diced Lamb, Beef, or King Prawns",
          "2 tablespoons vegetable oil",
          "1 jar Pasco Goannese Vindaloo Cooking Sauce",
          "1 tablespoon vinegar (white wine or apple cider)",
          "1 medium potato, cubed (traditional Goan style)",
          "1 clove garlic, minced"
        ],
        steps: [
          "Sear & Brown: Heat oil in a heavy pot. Add meat/prawns and cook until browned on all sides.",
          "Add Potato: Stir in minced garlic and cubed potatoes. Cook for another 3 minutes.",
          "Simmer: Pour in the Pasco Vindaloo Sauce and add vinegar for that Goan tang. Cover and simmer on low for 25 minutes (10 minutes for prawns) until tender.",
          "Rest & Serve: Let the curry rest for 5 minutes before serving with steamed basmati rice."
        ]
      };
    }

    if (name.includes('korma')) {
      return {
        title: "Royal Navratan Korma (Delicate & Creamy)",
        prep: "10 min",
        cook: "15 min",
        servings: "4",
        ingredients: [
          "500g Mixed vegetables (carrots, peas, corn) or Paneer",
          "2 tablespoons ghee or coconut oil",
          "1 jar Pasco Navratan Korma Cooking Sauce",
          "50g sliced almonds and cashews (garnish)",
          "50ml warm milk mixed with a pinch of saffron"
        ],
        steps: [
          "Sauté Veggies: Heat ghee in a pan. Sauté vegetables or paneer until lightly golden.",
          "Simmer: Pour in the Pasco Korma Cooking Sauce. Stir well, cover, and cook on low heat for 10 minutes.",
          "Infuse: Stir in the saffron-infused milk during the final 2 minutes of cooking for a royal golden hue.",
          "Top: Serve garnished with sliced almonds and cashews alongside fragrant cumin pilaf rice."
        ]
      };
    }

    if (name.includes('tagine') || name.includes('al rifai')) {
      return {
        title: "Aromatic Atlas Moroccan Tagine",
        prep: "15 min",
        cook: "40 min",
        servings: "4",
        ingredients: [
          "500g Lamb shoulder or chicken thighs, diced",
          "1 jar Al Rifai Tagine Sauce",
          "1 red onion, chopped",
          "2 carrots, sliced into thick rounds",
          "Handful of dried apricots or prunes",
          "1 tbsp olive oil"
        ],
        steps: [
          "Sauté Base: Heat olive oil in a tagine or deep pot. Sauté onion and meat until browned.",
          "Layer Veggies: Add the carrot slices and dried fruits around the meat.",
          "Slow Cook: Pour the Al Rifai Tagine Sauce over the top. Cover tightly, turn heat to low, and slow-cook for 35-40 minutes (longer for lamb) until tender.",
          "Serve: Fluff up some warm, steamed couscous and serve the hot tagine directly on top."
        ]
      };
    }

    if (name.includes('katsu') || name.includes('yellow river')) {
      return {
        title: "Yellow River Katsu Chicken Curry",
        prep: "15 min",
        cook: "15 min",
        servings: "2-3",
        ingredients: [
          "2 Chicken breasts (pounded flat) or Sweet potato slabs",
          "1 cup Panko breadcrumbs + 1 beaten egg + 2 tbsp flour",
          "1 jar Yellow River Katsu Curry Sauce",
          "Oil for shallow frying",
          "Sticky jasmine rice and pickled ginger"
        ],
        steps: [
          "Bread the Protein: Dust chicken or sweet potato with flour, dip in egg, coat in Panko breadcrumbs.",
          "Shallow Fry: Fry the breaded cutlets for 4-5 minutes on each side until golden. Slice into strips.",
          "Warm Sauce: Gently heat the Yellow River Katsu Curry Sauce in a separate saucepan over medium-low heat.",
          "Assemble: Serve sliced crispy cutlets over a bed of sticky rice, and pour the warm Katsu curry sauce generously over the top."
        ]
      };
    }

    return {
      title: "Family Tadka Tempering Stir-Fry",
      prep: "10 min",
      cook: "15 min",
      servings: "4",
      ingredients: [
        "500g of your chosen protein (chicken, paneer, lamb, prawns) or tofu",
        "2-3 tablespoons Pasco Spice Paste",
        "2 tablespoons cooking oil",
        "1 can (400g) chopped tomatoes or 150ml yogurt",
        "1 bell pepper and 1 onion, chopped"
      ],
      steps: [
        "Awaken the Spices: Heat oil in a pan. Add 2-3 tablespoons of Pasco Paste. Fry over medium heat for 2 minutes. Frying releases the locked essential spice oils!",
        "Sauté Veg & Meat: Toss in the protein and chopped onions/peppers, stirring constantly to coat in the rich spice paste.",
        "Add Liquid: Pour in chopped canned tomatoes (for tomato base) or fold in yogurt (for creamy base). Add 50ml water.",
        "Simmer: Simmer on low heat for 12-15 minutes until protein is cooked. Garnish with a squeeze of fresh lemon and serve."
      ]
    };
  };

  // 3D Jar Mouse Tilt Event Handlers
  const handleMouseMove = (e) => {
    if (jarFlipped) return; // Disable tilt when flipped to back label
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1
    const tiltX = (y - 0.5) * -35; // Tilt up to 35 deg vertically
    const tiltY = (x - 0.5) * 35; // Tilt up to 35 deg horizontally

    setTiltStyle({
      transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.06)`,
      filter: `drop-shadow(${(x - 0.5) * -20}px ${(y - 0.5) * -20}px 20px rgba(0, 0, 0, 0.25))`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)',
      filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))'
    });
  };

  // Render spiciness level badge
  const renderSpicinessBadge = (level) => {
    switch (level) {
      case 'none':
        return <span className="badge badge-heat-none">No Heat</span>;
      case 'mild':
        return <span className="badge badge-heat-mild"><Flame size={12} fill="#D97706" /> Mild</span>;
      case 'medium':
        return <span className="badge badge-heat-medium"><Flame size={12} fill="#EA580C" /> Medium</span>;
      case 'hot':
        return <span className="badge badge-heat-hot"><Flame size={12} fill="#DC2626" /><Flame size={12} fill="#DC2626" /> Hot</span>;
      case 'very hot':
        return <span className="badge badge-heat-veryhot"><Flame size={12} fill="#7F1D1D" /><Flame size={12} fill="#7F1D1D" /><Flame size={12} fill="#7F1D1D" /> Very Hot</span>;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Top Announcement Bar */}
      <div className={`announcement-bar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container announcement-container">
          <div className="announcement-left">
            <span>✨ <strong>10 for £10 Offers</strong> available! FREE factory shop collection at Wigan.</span>
            <button 
              onClick={() => setShowCaseStudyModal(true)} 
              style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '2px 8px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            >
              🏆 Migration Brief
            </button>
          </div>
          <div className="announcement-right">
            <span>📞 Call: 01942 493220</span>
            <span>✉️ sales@pascofoods.com</span>
          </div>
        </div>
      </div>

      {/* Floating Navigation Header */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a
            href="#"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="nav-logo-badge">
              <img
                src="https://www.pascofoods.co.uk/images/pasco-logo-500.png"
                alt="Pasco Foods Logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="nav-logo-text">
              <span className="brand-name">PASCO</span>
              <span className="brand-sub">FOODS</span>
            </div>
          </a>

          <ul className="nav-links">
            <li>
              <a
                href="#"
                className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              >
                Our Heritage
              </a>
            </li>
            <li className="nav-item-secondary">
              <a
                href="#craftsmanship"
                className={`nav-link ${activeSection === 'craftsmanship' ? 'active' : ''}`}
              >
                Our Process
              </a>
            </li>
            <li>
              <a
                href="#catalog"
                className={`nav-link ${activeSection === 'catalog' ? 'active' : ''}`}
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="#bundles"
                className={`nav-link ${activeSection === 'bundles' ? 'active' : ''}`}
              >
                Bundles
              </a>
            </li>
            <li>
              <a
                href="#recipes"
                className={`nav-link ${activeSection === 'recipes' ? 'active' : ''}`}
              >
                Recipes
              </a>
            </li>
            <li className="nav-item-secondary">
              <a
                href="#reviews"
                className={`nav-link ${activeSection === 'reviews' ? 'active' : ''}`}
              >
                Reviews
              </a>
            </li>
            <li>
              <a
                href="#finder"
                className={`nav-link ${activeSection === 'finder' ? 'active' : ''}`}
              >
                Spice Finder
              </a>
            </li>
            <li className="nav-item-secondary">
              <a
                href="#contact"
                className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
              >
                Contact Us
              </a>
            </li>

            {/* Dropdown for Secondary links on medium desktop screens */}
            <li className="nav-more-dropdown-container" ref={moreMenuRef}>
              <button
                className={`nav-link nav-more-btn ${['craftsmanship', 'reviews', 'contact'].includes(activeSection) ? 'active' : ''}`}
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                aria-expanded={moreMenuOpen}
              >
                More <ChevronRight size={14} style={{ transform: moreMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>
              {moreMenuOpen && (
                <div className="nav-dropdown-menu">
                  <a href="#craftsmanship" className="nav-dropdown-item" onClick={() => setMoreMenuOpen(false)}>
                    <Sparkles size={14} /> Our Process
                  </a>
                  <a href="#reviews" className="nav-dropdown-item" onClick={() => setMoreMenuOpen(false)}>
                    <CheckCircle size={14} /> Customer Reviews
                  </a>
                  <a href="#contact" className="nav-dropdown-item" onClick={() => setMoreMenuOpen(false)}>
                    <Phone size={14} /> Contact Us
                  </a>
                </div>
              )}
            </li>
          </ul>

          <div className="nav-cta">
            <button
              className="nav-search-btn"
              title="Search Catalog"
              onClick={() => {
                const catalogEl = document.getElementById('catalog');
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => {
                    const searchInput = document.querySelector('.search-box input');
                    if (searchInput) searchInput.focus();
                  }, 400);
                }
              }}
            >
              <Search size={18} />
            </button>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn nav-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{ color: '#1C1917', background: '#FFFFFF', border: '1px solid rgba(182,137,35,0.4)', fontWeight: 700 }}
                >
                  <User size={16} style={{ color: 'var(--brand-primary)' }} />
                  <span style={{ color: '#1C1917', fontWeight: 700 }}>{user.name.split(' ')[0]}</span>
                  <span className="user-badge-tag">
                    {user.customerType === 'Wholesale / Foodservice' ? 'Trade' : 'Retail'}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="glass user-dropdown-popover">
                    <div className="user-popover-name">{user.name}</div>
                    <div className="user-popover-email">{user.email}</div>
                    <div className="user-popover-token">Verified JWT Auth Token</div>
                    <button
                      className="btn btn-primary"
                      onClick={handleLogout}
                      style={{ width: '100%', padding: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn nav-user-btn"
                onClick={() => { setAuthMode('login'); setAuthError(null); setAuthModalOpen(true); }}
                style={{ color: '#1C1917', background: '#FFFFFF', border: '1px solid rgba(182,137,35,0.4)', fontWeight: 700 }}
              >
                <User size={16} style={{ color: 'var(--brand-primary)' }} /> <span style={{ color: '#1C1917', fontWeight: 700 }}>Login</span>
              </button>
            )}

            <button
              className="btn btn-gold cart-btn"
              onClick={() => setCartOpen(true)}
              title="Shopping Cart"
            >
              <ShoppingCart size={18} />
              <span className="cart-btn-label">Cart</span>
              {totalCartItems > 0 && (
                <span className="cart-badge-count">{totalCartItems}</span>
              )}
            </button>

            <a href="#catalog" className="btn btn-primary nav-catalog-btn">
              View Catalog
            </a>

            <button
              className="mobile-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle navigation menu"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {showMobileMenu && (
          <>
            <div className="mobile-nav-backdrop" onClick={() => setShowMobileMenu(false)} />
            <div className="mobile-nav-drawer">
              <div className="mobile-drawer-header">
                <div
                  className="nav-logo"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowMobileMenu(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <img
                    src="https://www.pascofoods.co.uk/images/pasco-logo-500.png"
                    alt="Pasco"
                    style={{ height: '36px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="nav-logo-text">
                    <span className="brand-name" style={{ color: 'var(--brand-primary)', textShadow: 'none', fontSize: '1.1rem' }}>PASCO</span>
                    <span className="brand-sub" style={{ color: 'var(--brand-secondary)' }}>FOODS</span>
                  </div>
                </div>
                <button className="mobile-drawer-close" onClick={() => setShowMobileMenu(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-drawer-content">
                {/* Search Box in Mobile Menu */}
                <div className="mobile-search-box">
                  <Search size={18} color="var(--text-secondary)" />
                  <input
                    type="text"
                    placeholder="Search catalogue products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      const catalogEl = document.getElementById('catalog');
                      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </div>

                <nav className="mobile-menu-list">
                  <a href="#" className={`mobile-menu-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => { setShowMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <Globe size={18} /> Home
                  </a>
                  <a href="#about" className={`mobile-menu-item ${activeSection === 'about' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <Award size={18} /> Our Heritage
                  </a>
                  <a href="#craftsmanship" className={`mobile-menu-item ${activeSection === 'craftsmanship' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <Sparkles size={18} /> Our Process
                  </a>
                  <a href="#catalog" className={`mobile-menu-item ${activeSection === 'catalog' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <ShoppingBag size={18} /> Product Catalogue
                  </a>
                  <a href="#bundles" className={`mobile-menu-item ${activeSection === 'bundles' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <Ticket size={18} /> Value Bundles
                  </a>
                  <a href="#recipes" className={`mobile-menu-item ${activeSection === 'recipes' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <Utensils size={18} /> Authentic Recipes
                  </a>
                  <a href="#reviews" className={`mobile-menu-item ${activeSection === 'reviews' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <CheckCircle size={18} /> Customer Reviews
                  </a>
                  <a href="#finder" className={`mobile-menu-item ${activeSection === 'finder' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <Flame size={18} /> Spice Finder Wizard
                  </a>
                  <a href="#contact" className={`mobile-menu-item ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
                    <Phone size={18} /> Contact Us
                  </a>
                </nav>
              </div>

              <div className="mobile-drawer-footer">
                {user ? (
                  <div style={{ background: 'var(--white)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(142, 28, 21, 0.1)' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{user.email}</div>
                    <button className="btn btn-outline" onClick={() => { handleLogout(); setShowMobileMenu(false); }} style={{ width: '100%', padding: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={() => { setShowMobileMenu(false); setAuthMode('login'); setAuthError(null); setAuthModalOpen(true); }} style={{ width: '100%', justifyContent: 'center' }}>
                    <User size={16} /> Login / Register
                  </button>
                )}
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', justifyContent: 'center' }}>
                  <a href="tel:01942493220" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> 01942 493220</a>
                  <span>•</span>
                  <a href="mailto:sales@pascofoods.com" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> Email Us</a>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Hero Banner Section with Dynamic Product Slider & Navigation Arrows */}
      <section className="hero" style={{ position: 'relative' }}>
        {/* Slide Navigation Arrows (Next & Previous) */}
        <button 
          className="hero-nav-arrow prev" 
          onClick={prevHeroSlide}
          aria-label="Previous Slide"
          title="Previous Product Offer"
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          className="hero-nav-arrow next" 
          onClick={nextHeroSlide}
          aria-label="Next Slide"
          title="Next Product Offer"
        >
          <ChevronRight size={28} />
        </button>

        {/* Dynamic Slide Background Image */}
        <div className="hero-background" key={heroSlides[currentHeroSlide].id}>
          <img src={heroSlides[currentHeroSlide].image} alt={heroSlides[currentHeroSlide].title} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div className="hero-content" key={`content-${currentHeroSlide}`}>
            <div className="hero-offer-badge" style={{ backgroundColor: heroSlides[currentHeroSlide].badgeColor }}>
              {heroSlides[currentHeroSlide].badge}
            </div>
            <span className="hero-tagline" style={{ display: 'block', marginBottom: '8px' }}>
              {heroSlides[currentHeroSlide].tag}
            </span>
            <h1 className="hero-title">
              {heroSlides[currentHeroSlide].title}, <span>{heroSlides[currentHeroSlide].titleAccent}.</span>
            </h1>
            <p className="hero-desc">
              {heroSlides[currentHeroSlide].desc}
            </p>
            <div className="hero-btns">
              <a 
                href={heroSlides[currentHeroSlide].primaryCtaHref} 
                className="btn btn-gold"
                onClick={(e) => {
                  if (heroSlides[currentHeroSlide].onPrimaryClick) {
                    heroSlides[currentHeroSlide].onPrimaryClick();
                  }
                }}
              >
                {heroSlides[currentHeroSlide].primaryCtaText} <ArrowRight size={18} />
              </a>
              <a href={heroSlides[currentHeroSlide].secondaryCtaHref} className="btn" style={{ border: '2px solid white', color: 'white' }}>
                {heroSlides[currentHeroSlide].secondaryCtaText}
              </a>
            </div>
          </div>
        </div>

        {/* Carousel Slider Dot Indicators */}
        <div className="hero-slider-dots">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              className={`hero-slider-dot ${idx === currentHeroSlide ? 'active' : ''}`}
              onClick={() => setCurrentHeroSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* About/Heritage Section */}
      <section id="about" className="about bg-mandala">
        <div className="container">
          <div className="about-grid">
            <div className="about-visual">
              <img src="/assets/farmer_heritage.jpg" alt="Heritage Indian Farming Roots" />
              <div className="about-badge-overlay glass-dark">
                <h4 style={{ fontFamily: 'var(--font-title)', fontWeight: 700, marginBottom: '4px', fontSize: '1.25rem', color: 'var(--brand-secondary)' }}>
                  Spices Grown on Our Own Plantations
                </h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  Grown on our own farm plantations in India in direct partnership with local farmers, bringing 100% natural, honest flavours directly to your home.
                </p>
              </div>
            </div>

            <div className="about-content">
              <span className="section-tag">Established 1990</span>
              <h2 className="section-title">
                Authentic Indian Flavours, <span>Crafted in the UK.</span>
              </h2>
              <p className="about-text">
                Our business began in our family kitchen in 1990 with four curry pastes that we supplied to our local curry house. Before we knew it, word spread and we were supplying curry pastes up and down the country.
              </p>
              <p className="about-text">
                In 1995, we decided to create a retail range so everyone could enjoy authentic Indian food at home — trouble was everything on the market was mass produced and contained saturated fats, E numbers, additives, preservatives, thick starches, and far too much water. From that day we made it our mission to create natural, honest flavours.
              </p>

              <div className="about-features">
                <div className="feat-item">
                  <Check className="feat-icon" size={20} />
                  <span>Additive & Preservative Free</span>
                </div>
                <div className="feat-item">
                  <Check className="feat-icon" size={20} />
                  <span>Gluten Free Options</span>
                </div>
                <div className="feat-item">
                  <Check className="feat-icon" size={20} />
                  <span>Vegetarian & Vegan Certified</span>
                </div>
                <div className="feat-item">
                  <Check className="feat-icon" size={20} />
                  <span>Halal Friendly Products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heritage Timeline Cards */}
          <div className="timeline-container" style={{ marginTop: '60px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--brand-primary)', marginBottom: '32px' }}>
              Our 30-Year Journey of Quality & Passion
            </h3>

            <div className="timeline-grid">
              <div className="timeline-card glass">
                <div className="timeline-year">1990</div>
                <h4>Family Kitchen Beginnings</h4>
                <p>Started in our home kitchen with 4 signature curry pastes supplied to the local UK curry house.</p>
              </div>

              <div className="timeline-card glass">
                <div className="timeline-year">1995</div>
                <h4>The Retail Revolution</h4>
                <p>Launched natural retail range to replace mass-produced products filled with E-numbers, starches & water.</p>
              </div>

              <div className="timeline-card glass">
                <div className="timeline-year">2000</div>
                <h4>100% Natural Sauce Innovation</h4>
                <p>Created 100% natural cooking sauces free from additives and preservatives, authentic and gluten-free.</p>
              </div>

              <div className="timeline-card glass">
                <div className="timeline-year">Today</div>
                <h4>Own Farm Plantations</h4>
                <p>Growing our own spices on our own farm plantations in India in direct partnership with local farmers to control quality from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Craft Our Products (Artisanal Process & Heritage) Section */}
      <section id="craftsmanship" className="craftsmanship-section">
        <div className="container">
          <div className="craft-header">
            <span className="section-tag" style={{ color: '#B68923', letterSpacing: '2px' }}>Modern UK Facility & Quality Standards</span>
            <h2 className="craft-main-title">How We Craft Our Authentic Products</h2>
            <p className="craft-subtitle">
              From direct farm partnerships in India to our state-of-the-art BRC-accredited manufacturing facility in Wigan — precision blending with pure family heritage.
            </p>
          </div>

          {/* 4 Pillars Step-by-Step Process Grid */}
          <div className="craft-pillars-grid">
            {/* SVG Filter for Hand-Drawn Texture */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
              <defs>
                <linearGradient id="sepiaGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8E1C15" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#B68923" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#8E1C15" stopOpacity="0.9" />
                </linearGradient>
                <filter id="handDrawnGlow">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>

            {/* Step 1 */}
            <div className="craft-pillar-card">
              <div className="craft-step-badge">STEP 01</div>
              <div className="craft-img-wrapper">
                <img src="/assets/spices.png" alt="Plantation Sourcing" />
              </div>
              <h3 className="craft-pillar-title">Plantation Sourcing</h3>
              <p className="craft-pillar-desc">
                Direct partnerships with spice farmers in India, bringing 100% natural, unadulterated whole spices directly to our UK facility.
              </p>
            </div>

            {/* Arrow Divider 1 -> 2 */}
            <div className="craft-process-arrow-divider">
              <svg className="craft-arrow-svg desktop-arrow" viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 6 20 Q 55 4 96 18" stroke="url(#sepiaGoldGrad)" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" filter="url(#handDrawnGlow)" />
                <path d="M 88 10 L 102 18 L 90 26" stroke="#8E1C15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDrawnGlow)" />
              </svg>
              <svg className="craft-arrow-svg mobile-arrow" viewBox="0 0 36 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 18 6 Q 30 30 18 48" stroke="url(#sepiaGoldGrad)" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" filter="url(#handDrawnGlow)" />
                <path d="M 10 40 L 18 54 L 26 40" stroke="#8E1C15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDrawnGlow)" />
              </svg>
              <span className="craft-arrow-label">Direct Import</span>
            </div>

            {/* Step 2 */}
            <div className="craft-pillar-card">
              <div className="craft-step-badge">STEP 02</div>
              <div className="craft-img-wrapper">
                <img src="/assets/pasco-foods-DEFRA-visit-3.jpg" alt="Steam-Kettle Blending" />
              </div>
              <h3 className="craft-pillar-title">Steam-Kettle Blending</h3>
              <p className="craft-pillar-desc">
                Slow-cooked in modern stainless steel steam-jacketed kettles in Wigan, unlocking deep aromatic oils without artificial starches.
              </p>
            </div>

            {/* Arrow Divider 2 -> 3 */}
            <div className="craft-process-arrow-divider">
              <svg className="craft-arrow-svg desktop-arrow" viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 6 20 Q 55 4 96 18" stroke="url(#sepiaGoldGrad)" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" filter="url(#handDrawnGlow)" />
                <path d="M 88 10 L 102 18 L 90 26" stroke="#8E1C15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDrawnGlow)" />
              </svg>
              <svg className="craft-arrow-svg mobile-arrow" viewBox="0 0 36 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 18 6 Q 30 30 18 48" stroke="url(#sepiaGoldGrad)" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" filter="url(#handDrawnGlow)" />
                <path d="M 10 40 L 18 54 L 26 40" stroke="#8E1C15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDrawnGlow)" />
              </svg>
              <span className="craft-arrow-label">Precision Heat</span>
            </div>

            {/* Step 3 */}
            <div className="craft-pillar-card">
              <div className="craft-step-badge">STEP 03</div>
              <div className="craft-img-wrapper">
                <img src="/assets/pasco-foods-DEFRA-visit-2.jpg" alt="Strict Quality Control" />
              </div>
              <h3 className="craft-pillar-title">Strict Quality Control</h3>
              <p className="craft-pillar-desc">
                SALSA & BRC accredited lab testing ensuring zero E-numbers, zero synthetic preservatives, and 100% gluten-free purity.
              </p>
            </div>

            {/* Arrow Divider 3 -> 4 */}
            <div className="craft-process-arrow-divider">
              <svg className="craft-arrow-svg desktop-arrow" viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 6 20 Q 55 4 96 18" stroke="url(#sepiaGoldGrad)" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" filter="url(#handDrawnGlow)" />
                <path d="M 88 10 L 102 18 L 90 26" stroke="#8E1C15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDrawnGlow)" />
              </svg>
              <svg className="craft-arrow-svg mobile-arrow" viewBox="0 0 36 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 18 6 Q 30 30 18 48" stroke="url(#sepiaGoldGrad)" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" filter="url(#handDrawnGlow)" />
                <path d="M 10 40 L 18 54 L 26 40" stroke="#8E1C15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDrawnGlow)" />
              </svg>
              <span className="craft-arrow-label">BRC Accredited</span>
            </div>

            {/* Step 4 */}
            <div className="craft-pillar-card">
              <div className="craft-step-badge">STEP 04</div>
              <div className="craft-img-wrapper">
                <img src="/assets/pasco-foods-DEFRA-visit-4.jpg" alt="Automated Bottling Line" />
              </div>
              <h3 className="craft-pillar-title">Automated Bottling Line</h3>
              <p className="craft-pillar-desc">
                High-speed automated glass jar conveyor bottling & hermetic sealing at our Wigan factory shop facility.
              </p>
            </div>
          </div>

          {/* Side Pictures & Center CTA Banner */}
          <div className="craft-banner-canvas">
            <div className="craft-side-illustration left" style={{ width: '130px', height: '130px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(182, 137, 35, 0.3)' }}>
              <img src="/assets/pasco-foods-DEFRA-visit-1.jpg" alt="Wigan Factory Tour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="craft-cta-center">
              <a href="#defra-tour" className="btn craft-cta-btn">
                EXPLORE OUR WIGAN FACTORY TOUR
              </a>
            </div>

            <div className="craft-side-illustration right" style={{ width: '130px', height: '130px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(182, 137, 35, 0.3)' }}>
              <img src="/assets/pasco-foods-DEFRA-visit-6.jpg" alt="Wigan Conveyor Line" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Catalog Section */}
      <section id="catalog" className="catalog-section bg-mandala">
        <div className="container">
          <div className="catalog-header">
            <span className="section-tag">Explore Catalog</span>
            <h2 className="section-title">Explore Our Premium <span>Product Ranges</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Browse through our authentic spice pastes, cooking sauces, dynamic pickles, and condiments. Use our filters below to find the perfect fit for your menu or dining table.
            </p>
          </div>

          <div className="catalog-controls">
            {/* Range Toggle */}
            <div className="range-filter">
              <button
                className={`range-tab ${activeRange === 'retail' ? 'active' : ''}`}
                onClick={() => handleRangeChange('retail')}
              >
                Retail Range
              </button>
              <button
                className={`range-tab ${activeRange === 'foodservice' ? 'active' : ''}`}
                onClick={() => handleRangeChange('foodservice')}
              >
                Foodservice Catering
              </button>
            </div>

            {/* Category Pill Slider */}
            <div className="categories-slider">
              <button
                className={`category-pill ${activeRangeType === 'All' ? 'active' : ''}`}
                onClick={() => setActiveRangeType('All')}
              >
                All Categories
              </button>
              {activeRangesList.map(type => (
                <button
                  key={type}
                  className={`category-pill ${activeRangeType === type ? 'active' : ''}`}
                  onClick={() => setActiveRangeType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Interactive Heat Spectrum Slider */}
            <div className="heat-spectrum-card glass animate-fade-in" style={{
              padding: '20px 24px', borderRadius: 'var(--border-radius-md)',
              margin: '10px 0 20px 0', border: '1px solid rgba(142, 28, 21, 0.08)',
              background: getHeatBackground(spicinessFilter),
              transition: 'background var(--transition-slow)'
            }}>
              <h4 style={{ fontFamily: 'var(--font-title)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                <Flame size={18} style={{ color: 'var(--brand-primary)' }} /> Spice Heat Spectrum Matcher
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Drag the heat slider to filter the catalog instantly matching your heat tolerance!
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={getSliderValue(spicinessFilter)}
                  onChange={handleSliderChange}
                  style={{ flexGrow: 1, height: '6px', borderRadius: 'var(--border-radius-full)', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />

                <div className="glass" style={{
                  padding: '10px 20px', borderRadius: 'var(--border-radius-full)',
                  fontWeight: 700, minWidth: '190px', textAlign: 'center', fontSize: '0.9rem',
                  border: '1px solid rgba(107, 87, 80, 0.15)', backgroundColor: 'var(--white)',
                  color: 'var(--text-primary)'
                }}>
                  {getHeatName(spicinessFilter)}
                </div>
              </div>
            </div>

            {/* Search and Filters grid */}
            <div className="filter-search-row">
              <div className="search-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products (e.g. Tikka, Jalfrezi, Korma)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="select-filter"
                  value={spicinessFilter}
                  onChange={(e) => setSpicinessFilter(e.target.value)}
                >
                  <option value="All">All Spice Levels</option>
                  <option value="none">No Heat</option>
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot</option>
                  <option value="very hot">Very Hot</option>
                </select>
              </div>

              <div className="dietary-filters">
                {['Vegetarian', 'Vegan', 'Gluten Free'].map(diet => (
                  <button
                    key={diet}
                    className={`dietary-checkbox-btn ${selectedDietary.includes(diet) ? 'active' : ''}`}
                    onClick={() => handleDietaryToggle(diet)}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Listing Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{
                margin: '0 auto 20px auto', width: '50px', height: '50px',
                border: '5px solid var(--bg-secondary)', borderTopColor: 'var(--brand-primary)',
                borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading catalog database...</p>
            </div>
          ) : error && filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Info size={48} className="empty-icon" />
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>{error}</p>
              <p>Showing backup records instead.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Info size={48} className="empty-icon" />
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>No Products Found</p>
              <p>Try resetting some filters or modifying your search terms.</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '20px', padding: '8px 20px', fontSize: '0.85rem' }}
                onClick={() => {
                  setActiveRangeType('All');
                  setSpicinessFilter('All');
                  setSelectedDietary([]);
                  setSearchTerm('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((p, idx) => (
                <div
                  key={p.productCode || idx}
                  className="product-card"
                  onClick={() => { setSelectedProduct(p); setActiveModalTab('info'); setJarFlipped(false); setTiltStyle({}); }}
                >
                  <div className="product-card-visual">
                    {/* Traditional Backdrop pattern */}
                    <div className="card-traditional-bg"></div>

                    {p.image ? (
                      <img 
                        src={`/assets/${p.image}`} 
                        alt={p.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          if (p.name.includes('Al Rifai') || p.productCode.startsWith('AR')) {
                            e.target.src = '/assets/al-rifai.jpg';
                          } else if (p.name.includes('Yellow River') || p.productCode.startsWith('YR')) {
                            e.target.src = '/assets/yellow-river.jpg';
                          } else if (p.name.includes('Pasta Roma') || p.productCode.startsWith('PR')) {
                            e.target.src = '/assets/pasta-roma.jpg';
                          } else {
                            e.target.src = '/assets/Cooking-Sauces-Slider.jpg';
                          }
                        }}
                      />
                    ) : (
                      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', zIndex: 2 }}>
                        <svg width="100" height="180" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M35 15C35 8 40 5 50 5C60 5 65 8 65 15V25H35V15Z" fill="#1C1917" />
                          <path d="M30 25H70V45C70 47 65 52 65 55V60C75 70 85 85 85 100V165C85 173 78 180 70 180H30C22 180 15 173 15 165V100C15 85 25 70 35 60V55C35 52 30 47 30 45V25Z" fill={p.rangeType.includes('Sauces') ? '#D65A31' : p.rangeType.includes('Pastes') ? '#801313' : p.rangeType.includes('Pickle') ? '#B68923' : '#D1A153'} />
                          <rect x="25" y="75" width="50" height="65" rx="4" fill="#FCFBF9" />
                          <circle cx="50" cy="100" r="15" fill="#E41F1F" opacity="0.1" />
                          <path d="M42 98L48 104L58 94" stroke="#8E1C15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {p.spiciness !== 'none' && (
                            <path d="M50 120C52 118 53 115 51 113C49 111 47 112 46 114C45 116 46 119 48 120C47 120 45 119 44 118C43 117 42 115 43 113C41 115 40 118 41 121C42 124 45 126 48 126C51 126 53 123 53 120C53 121 52 122 50 120Z" fill="#E41F1F" />
                          )}
                        </svg>
                      </div>
                    )}

                    {/* Vector Hand-Woven Wooden Basket Rim Overlay */}
                    <div className="wooden-basket-overlay">
                      <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <path d="M0,10 Q50,22 100,10 L100,30 L0,30 Z" fill="#784F2B" />
                        <path d="M0,14 Q25,22 50,15 Q75,22 100,14" stroke="#4E3117" strokeWidth="1.5" fill="none" opacity="0.5" />
                        <path d="M0,20 Q25,27 50,21 Q75,27 100,20" stroke="#4E3117" strokeWidth="1.5" fill="none" opacity="0.5" />
                        <path d="M10,12 L10,30 M25,14 L25,30 M40,15 L40,30 M55,15 L55,30 M70,14 L70,30 M85,13 L85,30" stroke="#3D2510" strokeWidth="1.2" opacity="0.3" />
                        <path d="M0,10 Q50,22 100,10" stroke="#9A693C" strokeWidth="2" fill="none" />
                      </svg>
                    </div>

                    <div className="product-tag-overlay">
                      {renderSpicinessBadge(p.spiciness)}
                      <span className="badge" style={{ backgroundColor: '#291F1C', color: '#FFF' }}>
                        {p.rangeType}
                      </span>
                    </div>
                  </div>

                  <div className="product-card-body">
                    <div className="product-card-meta">
                      <span className="product-card-code">Code: {p.productCode}</span>
                      <span>{p.size}</span>
                    </div>
                    <h3 className="product-card-title">{p.name}</h3>
                    <p className="product-card-desc">{p.description}</p>

                    <div className="product-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <button 
                        className="btn btn-gold btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px' }}
                        onClick={(e) => addToCart(p, 1, e)}
                      >
                        <ShoppingCart size={14} /> Add
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px', color: 'var(--brand-primary)', border: '1px solid rgba(142,28,21,0.3)' }}
                        onClick={(e) => openTastingModal(p, e)}
                      >
                        <Utensils size={14} /> Get Taste
                      </button>
                      <span className="product-card-action" style={{ fontSize: '0.78rem', marginLeft: 'auto' }}>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal Backdrop */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <X size={24} />
            </button>

            <div className="modal-grid">
              <div className="modal-visual">
                {/* Traditional Backdrop pattern */}
                <div className="card-traditional-bg"></div>

                {/* 3D Jar Packaging Viewer */}
                <div
                  className="jar-3d-container"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setJarFlipped(!jarFlipped)}
                >
                  <div className={`jar-3d-card ${jarFlipped ? 'flipped' : ''}`} style={jarFlipped ? {} : tiltStyle}>
                    {/* Front: The Crisp Product Jar Image */}
                    <div className="jar-3d-front">
                      {selectedProduct.image ? (
                        <img src={`/assets/${selectedProduct.image}`} alt={selectedProduct.name} />
                      ) : (
                        <svg width="150" height="240" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M35 15C35 8 40 5 50 5C60 5 65 8 65 15V25H35V15Z" fill="#1C1917" />
                          <path d="M30 25H70V45C70 47 65 52 65 55V60C75 70 85 85 85 100V165C85 173 78 180 70 180H30C22 180 15 173 15 165V100C15 85 25 70 35 60V55C35 52 30 47 30 45V25Z" fill={selectedProduct.rangeType.includes('Sauces') ? '#D65A31' : selectedProduct.rangeType.includes('Pastes') ? '#801313' : selectedProduct.rangeType.includes('Pickle') ? '#B68923' : '#D1A153'} />
                          <rect x="25" y="75" width="50" height="65" rx="4" fill="#FCFBF9" />
                          <circle cx="50" cy="100" r="15" fill="#E41F1F" opacity="0.1" />
                          <path d="M42 98L48 104L58 94" stroke="#8E1C15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Back: Styled Packaging Back Label (Nutrition & Ingredients) */}
                    <div className="jar-3d-back">
                      <div className="back-label-title">Back Packaging Label</div>

                      <div className="back-label-section">
                        <h5>Ingredients</h5>
                        <p>
                          {selectedProduct.rangeType.includes('Sauces')
                            ? "Tomatoes, water, double cream (milk), onions, garlic puree, ginger puree, vegetable oil, butter (milk), salt, ground coriander, ground cumin, red chili, turmeric, citric acid."
                            : selectedProduct.rangeType.includes('Pastes')
                              ? "Concentrated tomato paste, garlic puree, ginger puree, vegetable oil, ground coriander, cumin, turmeric, red chili, garam masala, salt, acetic acid."
                              : "Freshly sliced raw fruits/vegetables, mustard seed oil, fenugreek seeds, mustard seeds, red chili powder, turmeric, salt, vinegar, spice extracts."
                          }
                        </p>
                      </div>

                      <div className="back-label-section">
                        <h5>Dietary Info</h5>
                        <p>
                          Free from artificial colors, starches, additives, MSG, or hydrogenated oils. 100% natural, clean-label ingredients.
                        </p>
                      </div>

                      <div className="back-label-section" style={{ marginBottom: 0 }}>
                        <h5>Nutritional Information</h5>
                        <p style={{ fontSize: '0.6rem', marginBottom: '4px' }}>Typical values per 100g serving:</p>
                        <table className="nutrition-table">
                          <thead>
                            <tr>
                              <th>Energy</th>
                              <td>142 kcal / 594 kJ</td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>Fat</th>
                              <td>11.2g (Saturates: 1.5g)</td>
                            </tr>
                            <tr>
                              <th>Carbohydrates</th>
                              <td>7.8g (Sugars: 3.2g)</td>
                            </tr>
                            <tr>
                              <th>Protein</th>
                              <td>2.1g</td>
                            </tr>
                            <tr>
                              <th>Salt</th>
                              <td>1.1g</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual control button under bottle to trigger flipping */}
                <button className="jar-flip-btn" onClick={() => setJarFlipped(!jarFlipped)}>
                  <Sparkles size={12} /> {jarFlipped ? "View Front Label" : "Inspect Back Packaging"}
                </button>

                {/* Vector Hand-Woven Wooden Basket Rim Overlay for Modal */}
                <div className="wooden-basket-overlay">
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <path d="M0,10 Q50,22 100,10 L100,30 L0,30 Z" fill="#784F2B" />
                    <path d="M0,14 Q25,22 50,15 Q75,22 100,14" stroke="#4E3117" strokeWidth="1.5" fill="none" opacity="0.5" />
                    <path d="M0,20 Q25,27 50,21 Q75,27 100,20" stroke="#4E3117" strokeWidth="1.5" fill="none" opacity="0.5" />
                    <path d="M10,12 L10,30 M25,14 L25,30 M40,15 L40,30 M55,15 L55,30 M70,14 L70,30 M85,13 L85,30" stroke="#3D2510" strokeWidth="1.2" opacity="0.3" />
                    <path d="M0,10 Q50,22 100,10" stroke="#9A693C" strokeWidth="2.2" fill="none" />
                  </svg>
                </div>
              </div>

              <div className="modal-info">
                <div className="modal-header-meta">
                  {renderSpicinessBadge(selectedProduct.spiciness)}
                  <span className="badge" style={{ backgroundColor: '#291F1C', color: '#FFF' }}>
                    {selectedProduct.rangeType}
                  </span>
                </div>
                <h2 className="modal-title">{selectedProduct.name}</h2>
                <p className="modal-desc">{selectedProduct.description || "Our authentic products are made using a secret blend of herbs and spices only known to the Pasco family. Perfect as a base for a curry or as a marinade to roast, grill or barbecue."}</p>

                <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(107, 87, 80, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setActiveModalTab('info')}
                    className="range-tab"
                    style={{ background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '0.95rem', color: activeModalTab === 'info' ? 'var(--brand-primary)' : 'var(--text-secondary)', position: 'relative' }}
                  >
                    Technical Info
                    {activeModalTab === 'info' && <span style={{ position: 'absolute', bottom: '-14px', left: 0, right: 0, height: '3px', backgroundColor: 'var(--brand-primary)', borderRadius: '2px' }} />}
                  </button>
                  <button
                    onClick={() => setActiveModalTab('recipe')}
                    className="range-tab"
                    style={{ background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '0.95rem', color: activeModalTab === 'recipe' ? 'var(--brand-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
                  >
                    <Sparkles size={14} style={{ color: 'var(--brand-secondary)' }} /> Grandma's Recipe
                    {activeModalTab === 'recipe' && <span style={{ position: 'absolute', bottom: '-14px', left: 0, right: 0, height: '3px', backgroundColor: 'var(--brand-primary)', borderRadius: '2px' }} />}
                  </button>
                </div>

                {activeModalTab === 'info' ? (
                  <div className="animate-fade-in">
                    <div className="modal-specs">
                      <div className="spec-line">
                        <span className="spec-label">Product Code:</span>
                        <span className="spec-val">{selectedProduct.productCode || 'N/A'}</span>
                      </div>
                      <div className="spec-line">
                        <span className="spec-label">Unit Barcode:</span>
                        <span className="spec-val" style={{ fontFamily: 'monospace' }}>{selectedProduct.unitBarcode || 'N/A'}</span>
                      </div>
                      <div className="spec-line">
                        <span className="spec-label">Case Barcode:</span>
                        <span className="spec-val" style={{ fontFamily: 'monospace' }}>{selectedProduct.caseBarcode || 'N/A'}</span>
                      </div>
                      <div className="spec-line">
                        <span className="spec-label">Pack Size:</span>
                        <span className="spec-val">{selectedProduct.size}</span>
                      </div>
                    </div>

                    <div className="modal-tags">
                      <h4 className="modal-tags-title">Dietary Declarations</h4>
                      <div className="modal-tags-list" style={{ marginTop: '6px' }}>
                        {(selectedProduct.dietary || []).length > 0 ? (
                          selectedProduct.dietary.map(diet => (
                            <span key={diet} className="badge badge-dietary">
                              <Check size={10} style={{ marginRight: '2px' }} /> {diet}
                            </span>
                          ))
                        ) : (
                          <span className="badge badge-heat-none">All Natural Ingredients</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button 
                        className="btn btn-gold" 
                        style={{ flex: 1, padding: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={(e) => addToCart(selectedProduct, 1, e)}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)' }}
                        onClick={(e) => openTastingModal(selectedProduct, e)}
                      >
                        <Utensils size={16} /> Book Free Taste Slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(() => {
                      const recipe = getProductRecipe(selectedProduct);
                      if (!recipe) return <p>No recipe guide available for this item.</p>;
                      return (
                        <>
                          <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                            {recipe.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(107,87,80,0.08)' }}>
                            <div>⏱️ <strong>Prep:</strong> {recipe.prep}</div>
                            <div>🔥 <strong>Cook:</strong> {recipe.cook}</div>
                            <div>👥 <strong>Serves:</strong> {recipe.servings}</div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-primary)' }}>Ingredients</h4>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-primary)' }}>Method</h4>
                            <ol style={{ paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {recipe.steps.map((step, i) => {
                                const parts = step.split(': ');
                                return (
                                  <li key={i}>
                                    <strong>{parts[0]}:</strong> {parts[1]}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Our Brands Showcase Strip */}
      <section className="brands-strip" style={{ backgroundColor: '#FAF6EE', padding: '40px 0', borderBottom: '1px solid rgba(142, 28, 21, 0.08)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="section-tag">Official Brand Portfolio</span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              The Pasco Family of Premium Brands
            </h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <img src="/assets/Pasco-Logo.png" alt="Pasco Foods" style={{ height: '55px', objectFit: 'contain' }} />
            <img src="/assets/Pasta-Roma-Logo.png" alt="Pasta Roma Italian" style={{ height: '50px', objectFit: 'contain' }} />
            <img src="/assets/Al-Rifai-Logo.png" alt="Al Rifai Moroccan" style={{ height: '50px', objectFit: 'contain' }} />
            <img src="/assets/Yellow-River-Logo.png" alt="Yellow River Asian" style={{ height: '50px', objectFit: 'contain' }} />
            <img src="/assets/NYC-Logo.png" alt="NYC Condiments" style={{ height: '50px', objectFit: 'contain' }} />
          </div>
        </div>
      </section>

      {/* Special Offers & Bundles Section */}
      <section id="bundles" className="bundles-section bg-mandala" style={{ padding: '90px 0' }}>
        <div className="container">
          <div className="catalog-header" style={{ marginBottom: '40px' }}>
            <span className="section-tag">Special Offers & Collections</span>
            <h2 className="section-title">Pasco Curated <span>Flavor Bundles</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Discover our popular curated sauce and paste bundles, created to save you money while delivering authentic UK home & kitchen flavor.
            </p>
          </div>

          <div className="bundles-grid">
            <div className="bundle-card glass">
              <div style={{ width: '100%', height: '160px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/Cooking-Sauces-Slider.jpg" alt="Curry in a Hurry" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="bundle-badge">Best Seller</div>
              <h3>Curry in a Hurry (Mild)</h3>
              <p className="bundle-desc">Perfect for quick weekday family dinners without heat. Includes Navratan Korma, Delhi Tikka Masala, and Mild Curry Paste.</p>
              <div className="bundle-price-row">
                <span className="bundle-tag">3 Pack Bundle</span>
                <a href="#catalog" className="btn btn-gold" onClick={() => { setActiveRange('retail'); setActiveRangeType('Cooking Sauces'); }}>Shop Bundle</a>
              </div>
            </div>

            <div className="bundle-card glass">
              <div style={{ width: '100%', height: '160px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/Cooking-Pastes-Slider.jpg" alt="BBQ Bundle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="bundle-badge" style={{ backgroundColor: '#DC2626' }}>BBQ Season</div>
              <h3>BBQ & Grilling Bundle</h3>
              <p className="bundle-desc">Unleash smoky tandoori skewers and kebabs! Includes Tandoori Marinade, Tikka Marinade Paste, and Shish Kebab Paste.</p>
              <div className="bundle-price-row">
                <span className="bundle-tag">3 Pack Bundle</span>
                <a href="#catalog" className="btn btn-gold" onClick={() => { setActiveRange('retail'); setActiveRangeType('Cooking Pastes'); }}>Shop Bundle</a>
              </div>
            </div>

            <div className="bundle-card glass">
              <div style={{ width: '100%', height: '160px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/Chutneys-Slider.jpg" alt="Tickle the Pickle Bundle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="bundle-badge" style={{ backgroundColor: '#B68923' }}>Pickle Lover</div>
              <h3>Tickle the Pickle Bundle</h3>
              <p className="bundle-desc">A festive feast of authentic chutneys & pickles. Includes Mango Pickle, Lime Pickle Hot, Garlic & Chilli Pickle, and Sweet Mango Chutney.</p>
              <div className="bundle-price-row">
                <span className="bundle-tag">4 Pack Bundle</span>
                <a href="#catalog" className="btn btn-gold" onClick={() => { setActiveRange('retail'); setActiveRangeType('Pickles & Chutneys'); }}>Shop Bundle</a>
              </div>
            </div>

            <div className="bundle-card glass" style={{ border: '2px solid var(--brand-secondary)' }}>
              <div style={{ width: '100%', height: '160px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/pasco-slider-10-for-10.jpg" alt="10 for £10 Special Offers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="bundle-badge" style={{ backgroundColor: 'var(--brand-secondary)', color: '#1C1917' }}>Special Offer</div>
              <h3>10 for £10 Special Offers</h3>
              <p className="bundle-desc">Mix & Match 10 selected Pasco sauces, pastes, and pickles for just £10! UK delivery only.</p>
              <div className="bundle-price-row">
                <span className="bundle-tag" style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>10 Jar Value Pack</span>
                <a href="#contact" className="btn btn-primary">Order Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Family Recipes Section */}
      <section id="recipes" className="recipes-section bg-mandala" style={{ backgroundColor: 'var(--bg-secondary)', padding: '90px 0' }}>
        <div className="container">
          <div className="catalog-header" style={{ marginBottom: '40px' }}>
            <span className="section-tag">Pasco Kitchen Guides</span>
            <h2 className="section-title">Authentic Pasco <span>Family Recipes</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Tried and tested recipes straight from our family kitchen to help you cook restaurant-quality dishes effortlessly.
            </p>
          </div>

          <div className="recipes-grid">
            <div className="recipe-card glass">
              <div style={{ width: '100%', height: '180px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/recipe-Hydrabadi-Biryani.jpg" alt="Hyderabadi Biryani" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="recipe-card-header">
                <span className="recipe-badge">Fragrant Rice</span>
                <h4>Hyderabadi Biryani</h4>
                <div className="recipe-meta">⏱️ 50 mins | 👥 Serves 4</div>
              </div>
              <p>Traditionally made using lamb or veggies cooked in Pasco Biryani Paste and layered with basmati rice, mint & saffron.</p>
              <a href="#catalog" className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.85rem' }} onClick={() => { setActiveRange('retail'); setActiveRangeType('Cooking Pastes'); setSearchTerm('Biryani'); }}>View Biryani Paste</a>
            </div>

            <div className="recipe-card glass">
              <div style={{ width: '100%', height: '180px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/recipe-Methi-Chicken.jpg" alt="Methi Chicken" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="recipe-card-header">
                <span className="recipe-badge">North Indian Specialty</span>
                <h4>Methi Chicken</h4>
                <div className="recipe-meta">⏱️ 50 mins | 👥 Serves 4</div>
              </div>
              <p>Enhance chicken dishes with fresh fenugreek leaves, yogurt, and Pasco Mild Curry Paste for an authentic Punjabi aroma.</p>
              <a href="#catalog" className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.85rem' }} onClick={() => { setActiveRange('retail'); setActiveRangeType('Cooking Pastes'); setSearchTerm('Mild'); }}>View Mild Paste</a>
            </div>

            <div className="recipe-card glass">
              <div style={{ width: '100%', height: '180px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/recipe-Stuffed-Mushrooms.jpg" alt="Stuffed Tandoori Mushrooms" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="recipe-card-header">
                <span className="recipe-badge">Summer BBQ</span>
                <h4>Stuffed Tandoori Mushrooms</h4>
                <div className="recipe-meta">⏱️ 25 mins | 👥 Serves 4</div>
              </div>
              <p>Large portobello mushrooms marinated in Pasco Tandoori Marinade Paste and stuffed with spiced paneer or cheese.</p>
              <a href="#catalog" className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.85rem' }} onClick={() => { setActiveRange('retail'); setActiveRangeType('Cooking Pastes'); setSearchTerm('Tandoori'); }}>View Tandoori Paste</a>
            </div>

            <div className="recipe-card glass">
              <div style={{ width: '100%', height: '180px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/thumb-Lamb-Bhuna-Gosht.jpg" alt="Lamb Bhuna Gosht" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="recipe-card-header">
                <span className="recipe-badge">Restaurant Classic</span>
                <h4>Lamb Bhuna Gosht</h4>
                <div className="recipe-meta">⏱️ 50 mins | 👥 Serves 4</div>
              </div>
              <p>Slow-cooked lamb in a thick, well-browned spice gravy using Pasco Madras Curry Paste and fresh bell peppers.</p>
              <a href="#catalog" className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.85rem' }} onClick={() => { setActiveRange('retail'); setActiveRangeType('Cooking Pastes'); setSearchTerm('Madras'); }}>View Madras Paste</a>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="reviews-section" style={{ padding: '90px 0', backgroundColor: '#1C1917', color: 'white' }}>
        <div className="container">
          <div className="catalog-header" style={{ marginBottom: '50px' }}>
            <span className="section-tag" style={{ color: 'var(--brand-secondary)' }}>Loved Across The UK</span>
            <h2 className="section-title" style={{ color: 'white' }}>What Our Customers <span>Are Saying</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              Read verified testimonials from food lovers, home cooks, and restaurant chefs using Pasco Foods across the UK.
            </p>
          </div>

          <div className="reviews-grid">
            <div className="review-card glass" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ color: 'var(--brand-secondary)', fontSize: '1.2rem', marginBottom: '12px' }}>★★★★★</div>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                "I have tried Pasco’s mango chutney, chilli garlic pickle and hot curry paste. Very authentic Indian taste. Hot curry paste is my favourite now!"
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-secondary)' }}>— Verified UK Home Cook</div>
            </div>

            <div className="review-card glass" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ color: 'var(--brand-secondary)', fontSize: '1.2rem', marginBottom: '12px' }}>★★★★★</div>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                "We have tried the pickles and the spices they are very tasty. Just like Indian home taste. Really awesome!! Thank you Pasco Foods!"
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-secondary)' }}>— Authentic Flavor Enthusiast</div>
            </div>

            <div className="review-card glass" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ color: 'var(--brand-secondary)', fontSize: '1.2rem', marginBottom: '12px' }}>★★★★★</div>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                "Garlic-chilli pickle was very delicious, really good authentic Indian masala & pickles. Now on, I will always have all Pasco spices in my kitchen."
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-secondary)' }}>— Satisfied Customer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Defra Factory Visit and Tour Section with Lightbox */}
      <section id="defra-tour" className="defra-section" style={{ padding: '80px 0 50px 0', backgroundColor: '#FAF6EE', borderTop: '1px solid rgba(182, 137, 35, 0.15)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-tag" style={{ color: '#B68923' }}>Wigan Manufacturing HQ</span>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.3rem', fontWeight: 800, color: '#B68923', margin: '4px 0 10px 0' }}>
              Defra Factory Visit & Tour Gallery
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.5 }}>
              We were delighted to host an official factory visit and tour for the Department for Environment, Food and Rural Affairs (DEFRA) at our BRC-accredited Wigan facility. Click any photo below to inspect.
            </p>
          </div>

          <div className="defra-gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div 
                key={num} 
                className="defra-card" 
                onClick={() => setDefraLightboxImg(`/assets/pasco-foods-DEFRA-visit-${num}.jpg`)}
                style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  boxShadow: '0 6px 18px rgba(0,0,0,0.08)', 
                  border: '2px solid rgba(182,137,35,0.2)', 
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative'
                }}
              >
                <img 
                  src={`/assets/pasco-foods-DEFRA-visit-${num}.jpg`} 
                  alt={`Defra Factory Visit Photo ${num}`} 
                  style={{ width: '100%', height: '190px', objectFit: 'cover', display: 'block' }} 
                />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(28,25,23,0.75)', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  🔍 Enlarge
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEFRA Lightbox Modal */}
      {defraLightboxImg && (
        <div className="modal-backdrop" onClick={() => setDefraLightboxImg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', padding: '24px', background: '#1C1917', borderRadius: '16px' }}>
            <button className="modal-close-btn" onClick={() => setDefraLightboxImg(null)} style={{ color: '#FFF', background: 'rgba(255,255,255,0.2)' }}>
              <X size={24} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <img src={defraLightboxImg} alt="Pasco Wigan Factory Tour" style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px', marginBottom: '16px' }} />
              <div style={{ color: 'var(--brand-secondary)', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>
                Pasco Foods Limited — Wigan Manufacturing Facility & Cleanroom Laboratory
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '4px' }}>
                BRC & SALSA Accredited UK Food Manufacturing Headquarters
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Website Testimonials Section */}
      <section id="official-testimonials" className="official-testimonials-section" style={{ padding: '60px 0 80px 0', backgroundColor: '#FAF6EE', borderBottom: '1px solid rgba(182, 137, 35, 0.15)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.3rem', fontWeight: 800, color: '#B68923', margin: '0 0 10px 0' }}>
              Testimonials
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>
              Some of the kind words people have shared about our products.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '8px', border: '1px solid rgba(107,87,80,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontStyle: 'italic', fontSize: '1.02rem', color: '#2D3748', lineHeight: 1.5, marginBottom: '20px', fontWeight: 500 }}>
                "Traditional Indian aromatic food taste, thank you."
              </p>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2D3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  — DIGAMBAR PATANKAR
                </div>
                <div style={{ fontSize: '0.8rem', color: '#A0AEC0', marginTop: '2px' }}>
                  google.com review
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '8px', border: '1px solid rgba(107,87,80,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontStyle: 'italic', fontSize: '1.02rem', color: '#2D3748', lineHeight: 1.5, marginBottom: '20px', fontWeight: 500 }}>
                "Nice pickles range and curry sauce varieties."
              </p>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2D3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  — SHARAD KAMBLE
                </div>
                <div style={{ fontSize: '0.8rem', color: '#A0AEC0', marginTop: '2px' }}>
                  google.com review
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '8px', border: '1px solid rgba(107,87,80,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontStyle: 'italic', fontSize: '1.02rem', color: '#2D3748', lineHeight: 1.5, marginBottom: '20px', fontWeight: 500 }}>
                "Very Yummy gravy and pastes to make different dishes, lots of options to choose from. In this work from home scenario, these helped very much and still are. Great taste."
              </p>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2D3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  — ATUL SAWATE
                </div>
                <div style={{ fontSize: '0.8rem', color: '#A0AEC0', marginTop: '2px' }}>
                  google.com review
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Pagination Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E0' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E0' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D53F8C' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E0' }}></span>
          </div>
        </div>
      </section>

      {/* Interactive Spice Finder Matcher Wizard */}
      <section id="finder" className="finder-section">
        <div className="container finder-container">
          <div className="finder-header">
            <span className="section-tag" style={{ color: 'var(--brand-secondary)' }}>Taste Matcher</span>
            <h2 className="section-title" style={{ color: 'white' }}>Find Your Perfect <span>Spice Match</span></h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Unsure which paste or sauce fits your cooking goals today? Take our 30-second taste finder wizard!
            </p>
          </div>

          <div className="finder-card glass">
            {/* Step indicators */}
            <div className="finder-progress">
              <div className={`progress-step ${finderStep >= 1 ? 'completed' : 'active'}`}>1</div>
              <div className={`progress-step ${finderStep >= 2 ? (finderStep === 2 ? 'active' : 'completed') : ''}`}>2</div>
              <div className={`progress-step ${finderStep >= 3 ? (finderStep === 3 ? 'active' : 'completed') : ''}`}>3</div>
            </div>

            {/* STEP 0: Start Screen */}
            {finderStep === 0 && (
              <div className="finder-step-content" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center' }}>
                <Sparkles size={48} style={{ color: 'var(--brand-secondary)', marginBottom: '20px' }} />
                <h3 className="step-question">Ready to Discover Authentic Flavours?</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '32px', maxWidth: '500px' }}>
                  Answer three quick questions about your spice tolerance, preferred cuisine style, and cooking ingredients, and our database will match you with the ideal Pasco pastes and sauces.
                </p>
                <button className="btn btn-gold" onClick={() => setFinderStep(1)}>
                  Begin Taste Journey <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 1: Heat Tolerance */}
            {finderStep === 1 && (
              <div className="finder-step-content">
                <h3 className="step-question">1. Select Your Preferred Heat Level</h3>
                <div className="option-grid">
                  {[
                    { key: 'mild', title: 'Mild & Creamy', desc: 'Delicate cardamom, coconut & rich aromatic spices.' },
                    { key: 'medium', title: 'A Balanced Kick', desc: 'Authentic Indian restaurant heat level (Tikka Masala style).' },
                    { key: 'hot', title: 'Fiery & Rich', desc: 'Robust spices, cumin, garlic, and hot chilis.' },
                    { key: 'very_hot', title: 'Extreme Heat', desc: 'Vindaloo style heat with sharp chilis and tangy vinegar.' }
                  ].map(opt => (
                    <div
                      key={opt.key}
                      className={`option-card ${finderSelections.spiciness === opt.key ? 'selected' : ''}`}
                      onClick={() => handleFinderSelect('spiciness', opt.key)}
                    >
                      <div className="option-icon">
                        <Flame size={24} />
                      </div>
                      <div>
                        <div className="option-text-title">{opt.title}</div>
                        <div className="option-text-desc">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="finder-actions">
                  <button className="btn btn-secondary" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={resetFinder}>
                    Reset
                  </button>
                  <button
                    className="btn btn-gold"
                    disabled={!finderSelections.spiciness}
                    onClick={() => setFinderStep(2)}
                    style={{ opacity: finderSelections.spiciness ? 1 : 0.5 }}
                  >
                    Next Question <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Cuisine Style */}
            {finderStep === 2 && (
              <div className="finder-step-content">
                <h3 className="step-question">2. Choose Your Cuisine Style</h3>
                <div className="option-grid">
                  {[
                    { key: 'indian', title: 'Traditional Indian', desc: 'Authentic curry pastes, tandoori marinades, and classic cooking sauces.' },
                    { key: 'moroccan', title: 'Moroccan Aromatic', desc: 'Exotic apricot tagines, smoky harissa pastes, and meatball stews.' },
                    { key: 'chinese', title: 'Chinese/East Asian', desc: 'Yellow River range featuring Chinese Curry, Sweet & Sour, and Katsu.' },
                    { key: 'italian', title: 'Classic Italian Roma', desc: 'Pasta Roma range of tomato & garlic, chilli, and basil sauces.' }
                  ].map(opt => (
                    <div
                      key={opt.key}
                      className={`option-card ${finderSelections.cuisine === opt.key ? 'selected' : ''}`}
                      onClick={() => handleFinderSelect('cuisine', opt.key)}
                    >
                      <div className="option-icon">
                        <Globe size={24} />
                      </div>
                      <div>
                        <div className="option-text-title">{opt.title}</div>
                        <div className="option-text-desc">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="finder-actions">
                  <button className="btn btn-secondary" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={() => setFinderStep(1)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    className="btn btn-gold"
                    disabled={!finderSelections.cuisine}
                    onClick={() => setFinderStep(3)}
                    style={{ opacity: finderSelections.cuisine ? 1 : 0.5 }}
                  >
                    Next Question <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Protein/Veggie */}
            {finderStep === 3 && (
              <div className="finder-step-content">
                <h3 className="step-question">3. What is Your Main Cooking Ingredient?</h3>
                <div className="option-grid">
                  {[
                    { key: 'chicken', title: 'Poultry / Chicken', desc: 'Perfect for chicken tikka, butter chicken, and grilled skewers.' },
                    { key: 'meat', title: 'Red Meat (Beef / Lamb)', desc: 'Moroccan tagines, Rogan Josh, and slow-cooking curry sauces.' },
                    { key: 'seafood', title: 'Fish / Seafood', desc: 'Goannese Vindaloo, katsu curry, or aromatic pastes.' },
                    { key: 'vegetarian', title: 'Vegetables / Paneer / Tofu', desc: '100% vegetarian friendly sauces and pureed condiments.' }
                  ].map(opt => (
                    <div
                      key={opt.key}
                      className={`option-card ${finderSelections.protein === opt.key ? 'selected' : ''}`}
                      onClick={() => handleFinderSelect('protein', opt.key)}
                    >
                      <div className="option-icon">
                        <Check size={24} />
                      </div>
                      <div>
                        <div className="option-text-title">{opt.title}</div>
                        <div className="option-text-desc">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="finder-actions">
                  <button className="btn btn-secondary" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={() => setFinderStep(2)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    className="btn btn-gold"
                    disabled={!finderSelections.protein}
                    onClick={calculateRecommendations}
                    style={{ opacity: finderSelections.protein ? 1 : 0.5 }}
                  >
                    Match Me Now! <Sparkles size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Results Recommendations */}
            {finderStep === 4 && (
              <div className="finder-step-content results-wrapper">
                <Check size={40} style={{ color: 'var(--brand-secondary)', background: 'rgba(227, 153, 53, 0.1)', padding: '8px', borderRadius: '50%', marginBottom: '16px' }} />
                <h3 className="step-question" style={{ marginBottom: '8px' }}>Your Flavor Matches Are Ready!</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Based on your selections, we recommend trying these authentic Pasco Foods products:
                </p>

                <div className="results-grid">
                  {finderRecommendations.map((p, idx) => (
                    <div
                      key={p.productCode || idx}
                      className="glass"
                      style={{
                        padding: '20px', borderRadius: 'var(--border-radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer'
                      }}
                      onClick={() => { setSelectedProduct(p); setActiveModalTab('info'); setJarFlipped(false); setTiltStyle({}); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        {renderSpicinessBadge(p.spiciness)}
                        <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>{p.size}</span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--brand-secondary)' }}>
                        {p.name}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>
                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                        View Details <ChevronRight size={12} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="finder-actions" style={{ justifyContent: 'center', gap: '16px' }}>
                  <button className="btn btn-secondary" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={resetFinder}>
                    <RotateCcw size={18} /> Start Over
                  </button>
                  <a href="#catalog" className="btn btn-gold" onClick={() => {
                    // Set product search to recommendation range to show them in the catalog
                    if (finderRecommendations.length > 0) {
                      setActiveRange(finderRecommendations[0].category);
                      setActiveRangeType(finderRecommendations[0].rangeType);
                    }
                  }}>
                    Browse Similar Products
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact & Inquiry Form Section */}
      <section id="contact" className="contact-section bg-mandala">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Details Panel */}
            <div className="contact-info-panel">
              <div>
                <span className="section-tag">Get in Touch</span>
                <h2 className="section-title">Pasco Foods <span>Headquarters</span></h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  For retail, trade, foodservice inquiries or contract packaging options, please complete our contact form or reach out directly to Mr. Ahad Chowdhury at our UK headquarters.
                </p>
              </div>

              <div className="info-card glass">
                <h3 className="info-title">Office & Contact Info</h3>
                <div className="info-lines">
                  <div className="info-line">
                    <MapPin className="info-line-icon" size={20} />
                    <div>
                      <div className="info-line-title">Address</div>
                      <div className="info-line-content">
                        Pasco Foods Limited, Pasco House, Makerfield Way, Ince-in-Makerfield, Wigan, WN2 2PR, United Kingdom
                      </div>
                    </div>
                  </div>

                  <div className="info-line">
                    <Phone className="info-line-icon" size={20} />
                    <div>
                      <div className="info-line-title">Phone Support</div>
                      <div className="info-line-content">
                        01942 493220 (International: +44 1942 493220)
                      </div>
                    </div>
                  </div>

                  <div className="info-line">
                    <Mail className="info-line-icon" size={20} />
                    <div>
                      <div className="info-line-title">General Email</div>
                      <div className="info-line-content">
                        admin@pascofoods.com
                      </div>
                    </div>
                  </div>

                  <div className="info-line">
                    <Mail className="info-line-icon" size={20} />
                    <div>
                      <div className="info-line-title">Sales & Wholesale</div>
                      <div className="info-line-content">
                        sales@pascofoods.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Follow Our Flavor Journey</h4>
                <div className="social-bar">
                  <a href="https://www.facebook.com/pascofoods" className="social-circle">F</a>
                  <a href="https://twitter.com/pascofoods" className="social-circle">T</a>
                  <a href="https://www.instagram.com/pascofoods/" className="social-circle">I</a>
                </div>
              </div>
            </div>

            {/* Form Panel */}
            <div className="contact-form-panel glass">
              <h3 className="info-title" style={{ marginBottom: '24px' }}>Send An Inquiry</h3>

              {formSubmitStatus && (
                <div className={`submit-status ${formSubmitStatus.success ? 'submit-status-success' : 'submit-status-error'}`}>
                  {formSubmitStatus.success ? <Check size={18} /> : <Info size={18} />}
                  <span>{formSubmitStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      required
                      value={contactData.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      required
                      value={contactData.email}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (Optional)</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      className="form-control"
                      value={contactData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="form-control"
                      required
                      value={contactData.subject}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    required
                    value={contactData.message}
                    onChange={handleFormChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {formSubmitting ? 'Sending...' : 'Submit Inquiry'} <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Official Pasco Foods Website Footer */}
      <footer className="pasco-official-footer">
        <div className="pasco-footer-main">
          <div className="container">
            <div className="pasco-footer-grid">
              
              {/* Column 1: Brand Logo & Address */}
              <div className="pasco-footer-col">
                <div className="pasco-footer-logo">
                  <img src="https://www.pascofoods.co.uk/images/pasco-logo-500.png" alt="Pasco Foods - Natural Honest Flavours" />
                </div>
                <div className="pasco-footer-heading">ADDRESS</div>
                <div className="pasco-footer-text">
                  <strong>Pasco Foods Limited</strong><br />
                  Pasco House,<br />
                  Makerfield Way<br />
                  Ince-in-Makerfield<br />
                  Wigan WN2 2PR
                </div>
              </div>

              {/* Column 2: Contact Details & Services */}
              <div className="pasco-footer-col">
                <div className="pasco-footer-heading" style={{ marginTop: '76px' }}>CONTACT</div>
                <div className="pasco-footer-text">
                  <strong>Phone:</strong> 01942 493220<br />
                  <strong>Email:</strong> sales@pascofoods.com
                </div>
                <div className="pasco-footer-text" style={{ marginTop: '20px', fontWeight: 700 }}>
                  Private Label Services
                </div>
              </div>

              {/* Column 3: Follow Us Social Links */}
              <div className="pasco-footer-col">
                <div className="pasco-footer-heading" style={{ marginTop: '76px' }}>FOLLOW US</div>
                <div className="pasco-footer-socials">
                  <a href="https://facebook.com/pascofoods" target="_blank" rel="noreferrer" className="social-badge">f</a>
                  <a href="https://instagram.com/pascofoods" target="_blank" rel="noreferrer" className="social-badge">📸</a>
                  <a href="https://tiktok.com/@pascofoods" target="_blank" rel="noreferrer" className="social-badge">🎵</a>
                  <a href="https://linkedin.com/company/pasco-foods" target="_blank" rel="noreferrer" className="social-badge">in</a>
                </div>
              </div>

              {/* Column 4: Made in UK & SALSA Approved Badges */}
              <div className="pasco-footer-col badges-col">
                <div className="pasco-footer-badges">
                  <img src="/assets/badge-madeintheuk.png" alt="Made in the UK" className="accreditation-badge" />
                  <img src="/assets/badge-salsa.png" alt="SALSA Approved Supplier" className="accreditation-badge" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Darker Gold Copyright Bar */}
        <div className="pasco-footer-copyright">
          <div className="container">
            <div className="pasco-copyright-links">
              <a href="#catalog">Products</a> / <a href="#bundles">Bundles</a> / <a href="#contact">Contact</a> / <a href="#">Home</a> / <a href="#">Privacy Policy</a> / <a href="#">Terms of Service</a> / <a href="#">Refund Policy</a>
            </div>
            <div className="pasco-copyright-text">
              Copyright © {new Date().getFullYear()} All Rights Reserved. Site by Scene & Joolz Design
            </div>
          </div>
        </div>
      </footer>

      {/* Floating RAG AI Chatbot Widget */}
      <div className={`chatbot-container ${chatOpen ? 'open' : ''}`}>
        {/* Launcher Button */}
        <button 
          className="chatbot-launcher" 
          onClick={() => setChatOpen(!chatOpen)}
          aria-label="Toggle chatbot"
        >
          {chatOpen ? <X size={24} /> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} /> Ask AI</span>}
        </button>

        {/* Chat Window */}
        {chatOpen && (
          <div className="chatbot-window">
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="chatbot-title">Pasco AI Assistant</h4>
                  <span className="chatbot-status">Ollama RAG Active</span>
                </div>
              </div>
              <button className="chatbot-close-btn" onClick={() => setChatOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Message list */}
            <div className="chatbot-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
                  <div className="chat-bubble">
                    {/* Render basic formatting */}
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (line.trim() === '') return <div key={lIdx} style={{ height: '8px' }} />;
                      
                      // Process bold text
                      let processed = line;
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      let match;
                      const elements = [];
                      let lastIdx = 0;
                      
                      // Process bullet points
                      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');
                      // Clean bullet symbol
                      let lineClean = line.trim();
                      if (isBullet) {
                        if (lineClean.startsWith('•') || lineClean.startsWith('*') || lineClean.startsWith('-')) {
                          lineClean = lineClean.substring(1).trim();
                        }
                      }

                      while ((match = boldRegex.exec(lineClean)) !== null) {
                        if (match.index > lastIdx) {
                          elements.push(lineClean.substring(lastIdx, match.index));
                        }
                        elements.push(<strong key={match.index}>{match[1]}</strong>);
                        lastIdx = boldRegex.lastIndex;
                      }
                      if (lastIdx < lineClean.length) {
                        elements.push(lineClean.substring(lastIdx));
                      }

                      const finalContent = elements.length > 0 ? elements : lineClean;

                      if (isBullet) {
                        return <div key={lIdx} className="chat-bullet-line">🍛 {finalContent}</div>;
                      }
                      return <p key={lIdx} style={{ margin: 0 }}>{finalContent}</p>;
                    })}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-bubble-wrapper assistant">
                  <div className="chat-bubble loading">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Chips */}
            <div className="chatbot-suggestions">
              <button onClick={() => handleSendMessage("What cooking sauces do you have?")} className="suggestion-chip">
                🔍 Browse Sauces
              </button>
              <button onClick={() => handleSendMessage("Recommend something mild and gluten-free")} className="suggestion-chip">
                🌾 Mild & Gluten Free
              </button>
              <button onClick={() => handleSendMessage("How do I cook with Punjabi Butter Chicken?")} className="suggestion-chip">
                🍛 Butter Chicken Recipe
              </button>
            </div>

            {/* Input Form */}
            <form 
              className="chatbot-input-form" 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            >
              <input
                type="text"
                placeholder="Ask about ingredients, recipes, spice levels..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
            </form>
          </div>
        )}
      </div>

      {/* Assignment Showcase Modal */}
      {showCaseStudyModal && (
        <div className="modal-backdrop" onClick={() => setShowCaseStudyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '36px' }}>
            <button className="modal-close-btn" onClick={() => setShowCaseStudyModal(false)}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brand-primary)', marginBottom: '8px' }}>
              <Award size={24} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pasco Foods Limited — E-Commerce Migration Assignment
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Homepage Redesign & High-Scale Architecture Showcase
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              This web application was specifically built as the 2026 homepage migration assignment for <strong>Team Pasco Foods Limited</strong>, upgrading the 2011–2012 legacy HTML structure to a modern, high-speed, enterprise-grade architecture.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(142,28,21,0.1)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-primary)', marginBottom: '4px' }}>⚡ Sub-500ms Speed</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Built with React 18 + Vite + Node Express for instant page loads & 60fps rendering.</p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(142,28,21,0.1)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-primary)', marginBottom: '4px' }}>📦 85 Official Products</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Complete catalog with unit/case barcodes, sizes, heat ratings & dietary tags.</p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(142,28,21,0.1)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-primary)', marginBottom: '4px' }}>🏷️ 3D Jar Packaging Viewer</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interactive tilt & flip front/back label viewer with nutritional data.</p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(142,28,21,0.1)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-primary)', marginBottom: '4px' }}>🤖 RAG AI Assistant</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Embedded AI assistant providing instant cooking advice & product matches.</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-gold" onClick={() => setShowCaseStudyModal(false)}>
                Explore Recreated Homepage
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Slide-over Cart Drawer */}
      {cartOpen && (
        <div className="cart-drawer-backdrop" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={22} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontWeight: 800 }}>Your Shopping Cart</h3>
                <span className="cart-item-count-pill">{totalCartItems} {totalCartItems === 1 ? 'Item' : 'Items'}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag size={56} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h4>Your cart is empty</h4>
                  <p>Browse our 85 authentic Indian cooking sauces, pastes, chutneys, and foodservice ranges to start building your order!</p>
                  <button className="btn btn-gold" onClick={() => setCartOpen(false)}>Explore Catalog</button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.product.productCode} className="cart-item-card">
                      <div className="cart-item-img">
                        <img src={`/assets/${item.product.image}`} alt={item.product.name} />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-header">
                          <h4>{item.product.name}</h4>
                          <button className="cart-item-remove" onClick={() => removeFromCart(item.product.productCode)} title="Remove item">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="cart-item-meta">
                          <span>Size: {item.product.size}</span>
                          <span>Code: {item.product.productCode}</span>
                        </div>
                        <div className="cart-item-qty-row">
                          <div className="cart-qty-controls">
                            <button onClick={() => updateCartQuantity(item.product.productCode, -1)}><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.product.productCode, 1)}><Plus size={14} /></button>
                          </div>
                          <span className="cart-item-range-tag">{item.product.rangeType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-row">
                  <span>Total Items Selected:</span>
                  <strong>{totalCartItems} Units</strong>
                </div>
                <p className="cart-disclaimer">
                  💡 Wholesale & Trade pricing apply. Orders are submitted directly to Pasco Foods Limited Headquarters (Wigan, UK) for processing.
                </p>
                <div className="cart-footer-actions">
                  <button className="btn btn-outline" onClick={clearCart} style={{ fontSize: '0.85rem' }}>Clear Cart</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout & Order Submission Modal */}
      {checkoutOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', padding: '36px' }}>
            <button className="modal-close-btn" onClick={() => setCheckoutOpen(false)}>
              <X size={24} />
            </button>

            <div style={{ marginBottom: '24px' }}>
              <span className="section-tag">Direct Purchase Order</span>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 8px 0' }}>
                Complete Your Order Submission
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Your order items will be compiled into an official Purchase Order and submitted directly to <strong>Pasco Foods Limited Headquarters</strong> in Wigan, UK.
              </p>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Left Column: Customer Information */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={18} /> Contact & Delivery Details
                  </h4>

                  <div className="form-group">
                    <label>Full Name / Company Contact *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={checkoutData.name}
                      onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                      placeholder="e.g. John Smith / Royal Oak Restaurant"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required 
                      value={checkoutData.email}
                      onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                      placeholder="sales@example.co.uk"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      required 
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      placeholder="07123 456789"
                    />
                  </div>

                  <div className="form-group">
                    <label>Customer Account Type</label>
                    <select 
                      className="form-control"
                      value={checkoutData.customerType}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerType: e.target.value })}
                    >
                      <option value="Retail Consumer">Retail Consumer (Home Cook)</option>
                      <option value="Wholesale / Foodservice">Wholesale / Foodservice Caterer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fulfillment Preference *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="button"
                        className={`btn ${checkoutData.deliveryMethod === 'Store Takeout / Pickup' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCheckoutData({ ...checkoutData, deliveryMethod: 'Store Takeout / Pickup' })}
                        style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Store size={16} /> Store Takeout / Pickup
                      </button>
                      <button
                        type="button"
                        className={`btn ${checkoutData.deliveryMethod === 'UK Standard Delivery' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCheckoutData({ ...checkoutData, deliveryMethod: 'UK Standard Delivery' })}
                        style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Globe size={16} /> UK Courier Delivery
                      </button>
                    </div>
                  </div>

                  {/* Store Takeout Details Section */}
                  {checkoutData.deliveryMethod === 'Store Takeout / Pickup' && (
                    <div style={{ background: 'rgba(182, 137, 35, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(182, 137, 35, 0.2)', marginBottom: '16px' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={16} /> Select Nearby Store / Pickup Depot
                      </h5>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <select
                          className="form-control"
                          value={checkoutData.selectedStoreId}
                          onChange={(e) => setCheckoutData({ ...checkoutData, selectedStoreId: e.target.value })}
                          style={{ fontWeight: 600 }}
                        >
                          {nearbyStores.map((store) => (
                            <option key={store.id} value={store.id}>
                              📍 {store.name} ({store.distance}) — {store.city}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selected Store Info */}
                      {(() => {
                        const st = nearbyStores.find((s) => s.id === checkoutData.selectedStoreId) || nearbyStores[0];
                        return (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', background: '#FFF', padding: '10px', borderRadius: '6px', border: '1px solid rgba(107,87,80,0.1)' }}>
                            <div><strong>Address:</strong> {st.address}, {st.city}, {st.postcode}</div>
                            <div><strong>Hours:</strong> {st.hours} | <strong>Phone:</strong> {st.phone}</div>
                          </div>
                        );
                      })()}

                      {/* Pickup Date & Time Slot */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Pickup Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={checkoutData.pickupDate}
                            onChange={(e) => setCheckoutData({ ...checkoutData, pickupDate: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Time Slot *</label>
                          <select
                            className="form-control"
                            value={checkoutData.pickupTimeSlot}
                            onChange={(e) => setCheckoutData({ ...checkoutData, pickupTimeSlot: e.target.value })}
                          >
                            {availableTimeSlots.map((slot, idx) => (
                              <option key={idx} value={slot}>⏰ {slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Address & Notes */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} /> {checkoutData.deliveryMethod === 'Store Takeout / Pickup' ? 'Contact Address & Notes' : 'Shipping Address & Instructions'}
                  </h4>

                  <div className="form-group">
                    <label>Customer Address</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={checkoutData.address}
                      onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                      placeholder="Street name, premises, building number..."
                    ></textarea>
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>City / Town</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={checkoutData.city}
                        onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                        placeholder="Wigan / Manchester"
                      />
                    </div>
                    <div className="form-group">
                      <label>Postcode</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={checkoutData.postcode}
                        onChange={(e) => setCheckoutData({ ...checkoutData, postcode: e.target.value })}
                        placeholder="WN3 4AL"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Instructions / Notes</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      value={checkoutData.notes}
                      onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                      placeholder="Special pickup notes, vehicle registration, or packing preferences..."
                    ></textarea>
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ marginTop: '14px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={16} /> Select Payment Method *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div 
                        onClick={() => setPaymentMethod('Razorpay Secure Gateway')}
                        style={{ 
                          padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'Razorpay Secure Gateway' ? '2px solid var(--brand-primary)' : '1px solid rgba(107,87,80,0.2)',
                          background: paymentMethod === 'Razorpay Secure Gateway' ? 'rgba(142,28,21,0.05)' : '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <ShieldCheck size={18} style={{ color: 'var(--brand-primary)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Razorpay Secure</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cards, NetBanking, Wallets</div>
                        </div>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('Razorpay UPI / QR')}
                        style={{ 
                          padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'Razorpay UPI / QR' ? '2px solid var(--brand-primary)' : '1px solid rgba(107,87,80,0.2)',
                          background: paymentMethod === 'Razorpay UPI / QR' ? 'rgba(142,28,21,0.05)' : '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <QrCode size={18} style={{ color: 'var(--brand-primary)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Razorpay UPI / QR</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>GPay, PhonePe, Paytm, BHIM</div>
                        </div>
                      </div>

                      {checkoutData.deliveryMethod === 'Store Takeout / Pickup' && (
                        <div 
                          onClick={() => setPaymentMethod('Pay at Pickup Counter')}
                          style={{ 
                            padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'Pay at Pickup Counter' ? '2px solid var(--brand-primary)' : '1px solid rgba(107,87,80,0.2)',
                            background: paymentMethod === 'Pay at Pickup Counter' ? 'rgba(142,28,21,0.05)' : '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <Store size={18} style={{ color: 'var(--brand-primary)' }} />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Pay at Counter</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cash or Card on Pickup</div>
                          </div>
                        </div>
                      )}

                      <div 
                        onClick={() => setPaymentMethod('BACS Trade Credit')}
                        style={{ 
                          padding: '10px 12px', borderRadius: '8px', border: paymentMethod === 'BACS Trade Credit' ? '2px solid var(--brand-primary)' : '1px solid rgba(107,87,80,0.2)',
                          background: paymentMethod === 'BACS Trade Credit' ? 'rgba(142,28,21,0.05)' : '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <Wallet size={18} style={{ color: 'var(--brand-primary)' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Trade Credit BACS</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>30-Day Wholesale Invoice</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown Table */}
              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(142,28,21,0.1)', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Order Items List ({totalCartItems} Total Items)</span>
                  <span style={{ color: 'var(--brand-primary)' }}>Sending to Wigan HQ</span>
                </h4>
                <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(107,87,80,0.15)', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        <th style={{ padding: '6px' }}>Code</th>
                        <th style={{ padding: '6px' }}>Item Name</th>
                        <th style={{ padding: '6px' }}>Size</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product.productCode} style={{ borderBottom: '1px solid rgba(107,87,80,0.08)' }}>
                          <td style={{ padding: '6px', fontWeight: 700 }}>{item.product.productCode}</td>
                          <td style={{ padding: '6px' }}>{item.product.name}</td>
                          <td style={{ padding: '6px' }}>{item.product.size}</td>
                          <td style={{ padding: '6px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(107,87,80,0.2)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-primary)' }}>
                  <span>Total Amount Due:</span>
                  <span>£{cartTotalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setCheckoutOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={checkoutSubmitting}>
                  {checkoutSubmitting ? 'Processing Order...' : paymentMethod.includes('Razorpay') ? `Pay £${cartTotalAmount.toFixed(2)} via Razorpay 🔒` : 'Submit Order to Pasco HQ'} <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Payment Gateway Modal */}
      {razorpayModalOpen && (
        <div className="modal-backdrop" onClick={() => setRazorpayModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            
            {/* Razorpay Header Bar */}
            <div style={{ background: '#0C2340', padding: '20px 24px', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#3395FF', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#FFF', fontSize: '1.2rem' }}>
                  R
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>Razorpay Secure Checkout</div>
                  <div style={{ fontSize: '0.75rem', color: '#A0AEC0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} style={{ color: '#48BB78' }} /> 256-Bit Encrypted Payment Gateway
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#A0AEC0', textTransform: 'uppercase' }}>Amount to Pay</div>
                <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#3395FF' }}>£{cartTotalAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              
              {/* Payment Tabs */}
              <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setRazorpayTab('card')}
                  style={{
                    flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: 'none', cursor: 'pointer',
                    borderBottom: razorpayTab === 'card' ? '3px solid #3395FF' : 'none', color: razorpayTab === 'card' ? '#0C2340' : '#718096'
                  }}
                >
                  💳 Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayTab('upi')}
                  style={{
                    flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: 'none', cursor: 'pointer',
                    borderBottom: razorpayTab === 'upi' ? '3px solid #3395FF' : 'none', color: razorpayTab === 'upi' ? '#0C2340' : '#718096'
                  }}
                >
                  📱 Razorpay UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayTab('netbanking')}
                  style={{
                    flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.88rem', border: 'none', background: 'none', cursor: 'pointer',
                    borderBottom: razorpayTab === 'netbanking' ? '3px solid #3395FF' : 'none', color: razorpayTab === 'netbanking' ? '#0C2340' : '#718096'
                  }}
                >
                  🏦 NetBanking
                </button>
              </div>

              {/* Card Payment Form */}
              {razorpayTab === 'card' && (
                <div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568' }}>Card Number</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="4532 8912 3456 7890"
                        style={{ paddingLeft: '38px', fontWeight: 600 }}
                      />
                      <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#A0AEC0' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568' }}>Expiry</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        placeholder="MM/YY"
                        style={{ textAlign: 'center', fontWeight: 600 }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568' }}>CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        maxLength={4}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        placeholder="888"
                        style={{ textAlign: 'center', fontWeight: 600 }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568' }}>Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        placeholder="Name on card"
                        style={{ fontWeight: 600 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI & QR Code Form */}
              {razorpayTab === 'upi' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '14px' }}>
                    <QrCode size={120} style={{ color: '#0C2340' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', marginTop: '6px' }}>Scan QR Code with GPay, PhonePe, Paytm</div>
                  </div>

                  <div className="form-group" style={{ maxWidth: '320px', margin: '0 auto' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4A5568' }}>Or Enter UPI VPA ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="user@upi / mobile@okicici"
                      style={{ textAlign: 'center', fontWeight: 600 }}
                    />
                  </div>
                </div>
              )}

              {/* NetBanking Selection */}
              {razorpayTab === 'netbanking' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {['HDFC Bank', 'ICICI Bank', 'SBI NetBanking', 'Axis Bank', 'Barclays UK', 'HSBC Commercial'].map((bank, idx) => (
                    <div key={idx} style={{ padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: '#F7FAFC', fontSize: '0.85rem', fontWeight: 600, color: '#2D3748', textAlign: 'center' }}>
                      🏦 {bank}
                    </div>
                  ))}
                </div>
              )}

              {/* Razorpay Trust Badges */}
              <div style={{ background: '#F7FAFC', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span>🔒 Powered by Razorpay SSL</span>
                <span>PCI-DSS Level 1 Compliant</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRazorpayModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={processRazorpayPayment}
                  disabled={razorpayProcessing}
                  style={{ flex: 2, background: '#3395FF', color: '#FFF', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {razorpayProcessing ? (
                    <>Processing Razorpay Payment...</>
                  ) : (
                    <>Pay £{cartTotalAmount.toFixed(2)} via Razorpay 🔒</>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Receipt Modal */}
      {completedOrder && (
        <div className="modal-backdrop" onClick={() => setCompletedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '36px', textAlign: 'center' }}>
            <button className="modal-close-btn" onClick={() => setCompletedOrder(null)}>
              <X size={24} />
            </button>

            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle size={36} />
            </div>

            <span className="section-tag" style={{ color: '#16A34A' }}>Order Submitted Successfully</span>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 8px 0' }}>
              Order Reference #{completedOrder.orderNumber}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Thank you, <strong>{completedOrder.customer.name}</strong>! Your order list of <strong>{completedOrder.totalItems} items</strong> has been officially transmitted to <strong>Pasco Foods Limited Headquarters</strong> in Wigan.
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(142,28,21,0.1)', textAlign: 'left', marginBottom: '24px', fontSize: '0.88rem' }}>
              
              {/* Payment Summary Box */}
              <div style={{ background: 'rgba(51, 149, 255, 0.08)', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(51, 149, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, color: '#0C2340', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} style={{ color: '#3395FF' }} /> {completedOrder.paymentMethod || 'Razorpay Secure Gateway'}
                  </span>
                  <span style={{ background: '#16A34A', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {completedOrder.paymentStatus || 'Paid'}
                  </span>
                </div>
                {completedOrder.paymentTransactionId && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Transaction Reference ID:</strong> <code style={{ background: '#FFF', padding: '2px 6px', borderRadius: '4px', color: '#0C2340', fontWeight: 700 }}>{completedOrder.paymentTransactionId}</code>
                  </div>
                )}
                {completedOrder.totalAmount > 0 && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '4px' }}>
                    Total Amount Paid: £{completedOrder.totalAmount.toFixed(2)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(107,87,80,0.1)', paddingBottom: '8px' }}>
                <span><strong>Fulfillment:</strong> {completedOrder.customer.deliveryMethod}</span>
                <span><strong>Type:</strong> {completedOrder.customer.customerType}</span>
              </div>

              {completedOrder.customer.deliveryMethod === 'Store Takeout / Pickup' && completedOrder.customer.pickupStore && (
                <div style={{ background: 'rgba(182, 137, 35, 0.12)', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(182, 137, 35, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Store size={16} /> Takeout & Store Pickup Confirmation:
                  </div>
                  <div><strong>Pickup Location:</strong> {completedOrder.customer.pickupStore.name}</div>
                  <div><strong>Address:</strong> {completedOrder.customer.pickupStore.address}, {completedOrder.customer.pickupStore.city} ({completedOrder.customer.pickupStore.postcode})</div>
                  <div><strong>Scheduled Pickup:</strong> 🗓️ {completedOrder.customer.pickupDate} at ⏰ {completedOrder.customer.pickupTimeSlot}</div>
                  <div><strong>Store Contact:</strong> {completedOrder.customer.pickupStore.phone}</div>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <strong>Submitted Contact Email:</strong> {completedOrder.customer.email} | <strong>Phone:</strong> {completedOrder.customer.phone}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '6px' }}>Submitted Order Items:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                {completedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.quantity}x {item.name} ({item.size}) — Code: {item.productCode}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Need urgent assistance with this order? Contact Wigan HQ directly at <strong>01942 493220</strong> or email <strong>sales@pascofoods.com</strong>.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => handlePrintPO(completedOrder)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}
              >
                🖨️ Print Purchase Order PDF
              </button>
              <button className="btn btn-gold" onClick={() => setCompletedOrder(null)} style={{ flex: 1 }}>
                Continue Shopping Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Login & Sign Up Modal */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '32px' }}>
            <button className="modal-close-btn" onClick={() => setAuthModalOpen(false)}>
              <X size={24} />
            </button>

            {/* Header Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid rgba(107,87,80,0.1)', marginBottom: '20px' }}>
              <button
                style={{
                  flex: 1, padding: '10px', background: 'none', border: 'none',
                  fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '1rem',
                  color: authMode === 'login' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  borderBottom: authMode === 'login' ? '3px solid var(--brand-primary)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
              >
                <Lock size={16} style={{ display: 'inline', marginRight: '6px' }} /> Account Login
              </button>
              <button
                style={{
                  flex: 1, padding: '10px', background: 'none', border: 'none',
                  fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '1rem',
                  color: authMode === 'signup' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  borderBottom: authMode === 'signup' ? '3px solid var(--brand-primary)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
              >
                <UserPlus size={16} style={{ display: 'inline', marginRight: '6px' }} /> Create Account
              </button>
            </div>

            {/* Quick Demo Login Bar */}
            <div style={{ background: 'rgba(182,137,35,0.08)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(182,137,35,0.2)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                ⚡ Quick Demo One-Click Login:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  onClick={() => quickLoginAs('john@example.co.uk', 'password123')}
                >
                  👤 John Smith (Retail)
                </button>
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  onClick={() => quickLoginAs('trade@curryhouse.co.uk', 'pasco123')}
                >
                  👨‍🍳 Chef Ahad (Wholesale)
                </button>
              </div>
            </div>

            {authError && (
              <div style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid rgba(220,38,38,0.2)' }}>
                ⚠️ {authError}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={authFormData.email}
                    onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                    placeholder="john@example.co.uk"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={authFormData.password}
                    onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={authSubmitting}>
                  {authSubmitting ? 'Authenticating...' : 'Sign In with JWT'} <Key size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label>Full Name / Trade Contact *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={authFormData.name}
                    onChange={(e) => setAuthFormData({ ...authFormData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={authFormData.email}
                    onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                    placeholder="sarah@example.co.uk"
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={authFormData.password}
                    onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={authFormData.phone}
                    onChange={(e) => setAuthFormData({ ...authFormData, phone: e.target.value })}
                    placeholder="07123 456789"
                  />
                </div>

                <div className="form-group">
                  <label>Account Type</label>
                  <select
                    className="form-control"
                    value={authFormData.customerType}
                    onChange={(e) => setAuthFormData({ ...authFormData, customerType: e.target.value })}
                  >
                    <option value="Retail Consumer">Retail Consumer (Home Cook)</option>
                    <option value="Wholesale / Foodservice">Wholesale / Foodservice Caterer</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={authSubmitting}>
                  {authSubmitting ? 'Creating Account...' : 'Register Account'} <UserPlus size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Book Free Taste Slot Modal */}
      {tastingModalProduct && (
        <div className="modal-backdrop" onClick={() => setTastingModalProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '32px' }}>
            <button className="modal-close-btn" onClick={() => setTastingModalProduct(null)}>
              <X size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', background: 'rgba(182, 137, 35, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(182, 137, 35, 0.2)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {tastingModalProduct.image ? (
                  <img src={`/assets/${tastingModalProduct.image}`} alt={tastingModalProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Utensils size={28} style={{ color: 'var(--brand-primary)' }} />
                )}
              </div>
              <div>
                <span className="section-tag" style={{ fontSize: '0.72rem', color: 'var(--brand-primary)' }}>Free In-Store Chef Tasting</span>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0' }}>
                  {tastingModalProduct.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Product Code: {tastingModalProduct.productCode} ({tastingModalProduct.size})</span>
              </div>
            </div>

            <form onSubmit={handleTastingSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: 700 }}>Select Nearby Tasting Location / Store *</label>
                <select
                  className="form-control"
                  value={tastingFormData.selectedStoreId}
                  onChange={(e) => setTastingFormData({ ...tastingFormData, selectedStoreId: e.target.value })}
                  style={{ fontWeight: 600 }}
                >
                  {nearbyStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      📍 {store.name} ({store.distance}) — {store.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Store snippet */}
              {(() => {
                const st = nearbyStores.find((s) => s.id === tastingFormData.selectedStoreId) || nearbyStores[0];
                return (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', background: '#FFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(107,87,80,0.12)' }}>
                    <div><strong>Address:</strong> {st.address}, {st.city}, {st.postcode}</div>
                    <div><strong>Tasting Hours:</strong> {st.hours} | <strong>Phone:</strong> {st.phone}</div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Tasting Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={tastingFormData.tastingDate}
                    onChange={(e) => setTastingFormData({ ...tastingFormData, tastingDate: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Time Window *</label>
                  <select
                    className="form-control"
                    value={tastingFormData.tastingTimeSlot}
                    onChange={(e) => setTastingFormData({ ...tastingFormData, tastingTimeSlot: e.target.value })}
                  >
                    {tastingTimeSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>⏰ {slot}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Party Size</label>
                  <select
                    className="form-control"
                    value={tastingFormData.partySize}
                    onChange={(e) => setTastingFormData({ ...tastingFormData, partySize: parseInt(e.target.value) })}
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 People</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4 People Group</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(107,87,80,0.1)', paddingTop: '14px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '10px' }}>
                  Your Contact Details for Ticket Voucher
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={tastingFormData.name}
                      onChange={(e) => setTastingFormData({ ...tastingFormData, name: e.target.value })}
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.8rem' }}>Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={tastingFormData.email}
                      onChange={(e) => setTastingFormData({ ...tastingFormData, email: e.target.value })}
                      placeholder="john@example.co.uk"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setTastingModalProduct(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={tastingSubmitting}>
                  {tastingSubmitting ? 'Booking Slot...' : 'Confirm Free Taste Slot Booking'} <Utensils size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Tasting Pass Confirmation Voucher Modal */}
      {completedTastingBooking && (
        <div className="modal-backdrop" onClick={() => setCompletedTastingBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '36px', textAlign: 'center' }}>
            <button className="modal-close-btn" onClick={() => setCompletedTastingBooking(null)}>
              <X size={24} />
            </button>

            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(182, 137, 35, 0.15)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Ticket size={36} />
            </div>

            <span className="section-tag" style={{ color: 'var(--brand-primary)' }}>Official Pasco Free Tasting Pass</span>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 4px 0' }}>
              Voucher Reference #{completedTastingBooking.bookingReference}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your in-store tasting slot for <strong>{completedTastingBooking.productName}</strong> has been officially reserved!
            </p>

            {/* Digital Pass Ticket Card */}
            <div style={{ background: 'linear-gradient(135deg, #FAF6EE 0%, #FFF 100%)', padding: '20px', borderRadius: '12px', border: '2px dashed var(--brand-secondary)', textAlign: 'left', marginBottom: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(182, 137, 35, 0.2)', paddingBottom: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 700 }}>Pasco Foods Tasting Pass</span>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{completedTastingBooking.productName}</div>
                </div>
                <div style={{ background: 'var(--brand-primary)', color: '#FFF', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                  {completedTastingBooking.partySize} {completedTastingBooking.partySize === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>

              <div style={{ fontSize: '0.86rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Reserved Location:</div>
                  <strong>{completedTastingBooking.store.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{completedTastingBooking.store.address}, {completedTastingBooking.store.city} ({completedTastingBooking.store.postcode})</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Date & Time Window:</div>
                  <strong>🗓️ {completedTastingBooking.tastingDate}</strong>
                  <div>⏰ {completedTastingBooking.tastingTimeSlot}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#15803D', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Present this digital pass or voucher code <strong>#{completedTastingBooking.bookingReference}</strong> at the tasting counter!
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Need to reschedule? Call <strong>{completedTastingBooking.store.phone}</strong> or email <strong>sales@pascofoods.com</strong>.
            </div>

            <button className="btn btn-gold" onClick={() => setCompletedTastingBooking(null)} style={{ width: '100%' }}>
              Done / Return to Products Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback products catalog data in case the server fails to load or runs completely offline.
const fallbackProducts = [
  {
    "name": "Delhi Tikka Masala Cooking Sauce",
    "category": "retail",
    "rangeType": "Cooking Sauces",
    "size": "350G",
    "productCode": "11518",
    "unitBarcode": "7178602000018",
    "caseBarcode": "7178600003042",
    "description": "A luxurious Delhi style tomato sauce perfectly spiced with hints of cumin & coriander. All natural ingredients.",
    "image": "extracted_p5_img1.png",
    "spiciness": "medium",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Mumbai Palak Masala Cooking Sauce",
    "category": "retail",
    "rangeType": "Cooking Sauces",
    "size": "350G",
    "productCode": "11461",
    "unitBarcode": "7178604000061",
    "caseBarcode": "7178600004063",
    "description": "A fragrant, creamy spinach sauce blended with authentic spices. Made in the UK using locally sourced ingredients.",
    "image": "extracted_p5_img3.png",
    "spiciness": "medium",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Goanese Vindaloo Cooking Sauce",
    "category": "retail",
    "rangeType": "Cooking Sauces",
    "size": "350G",
    "productCode": "11471",
    "unitBarcode": "7178604000054",
    "caseBarcode": "7178600004049",
    "description": "A hot, fiery sauce with a distinct tangy vinegar punch and roasted aromatic spices. Authentic Goan style.",
    "image": "extracted_p5_img6.png",
    "spiciness": "very hot",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Punjabi Butter Chicken Cooking Sauce",
    "category": "retail",
    "rangeType": "Cooking Sauces",
    "size": "350G",
    "productCode": "11466",
    "unitBarcode": "7178604000030",
    "caseBarcode": "7178600004056",
    "description": "A rich, creamy tomato and onion sauce blended with traditional butter chicken spices.",
    "image": "extracted_p5_img5.png",
    "spiciness": "medium",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Navratan Korma Cooking Sauce",
    "category": "retail",
    "rangeType": "Cooking Sauces",
    "size": "350G",
    "productCode": "11516",
    "unitBarcode": "7178602000025",
    "caseBarcode": "7178600003028",
    "description": "A rich, mild creamy sauce with coconut, yogurt, and a delicate blend of authentic cardamom and nuts.",
    "image": "extracted_p5_img2.png",
    "spiciness": "mild",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Rajastani Jalfrezi Cooking Sauce",
    "category": "retail",
    "rangeType": "Cooking Sauces",
    "size": "350G",
    "productCode": "11515",
    "unitBarcode": "7178604000023",
    "caseBarcode": "7178600004018",
    "description": "A tangy, spiced tomato sauce combined with sweet bell peppers, onions, and fresh coriander.",
    "image": "extracted_p5_img4.png",
    "spiciness": "hot",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Tandoori Marinade Paste",
    "category": "retail",
    "rangeType": "Cooking Pastes",
    "size": "260G",
    "productCode": "11520",
    "unitBarcode": "7178600000058",
    "caseBarcode": "7178600001000",
    "description": "An aromatic cooking paste lightly spiced with hints of coriander and red chili. Perfect for grilling or roasting chicken, paneer, and veggies.",
    "image": "extracted_p7_img1.png",
    "spiciness": "medium",
    "dietary": ["Vegetarian", "Gluten Free"]
  },
  {
    "name": "Mango Pickle Mild",
    "category": "retail",
    "rangeType": "Pickles & Chutneys",
    "size": "260G",
    "productCode": "11570",
    "unitBarcode": "71786000000188",
    "caseBarcode": "7178600001147",
    "description": "Traditionally prepared mild pickle with tender raw green mangoes and spices.",
    "image": "extracted_p9_img1.png",
    "spiciness": "mild",
    "dietary": ["Vegetarian", "Vegan", "Gluten Free"]
  },
  {
    "name": "Garlic Puree",
    "category": "retail",
    "rangeType": "Condiments",
    "size": "260G",
    "productCode": "11594",
    "unitBarcode": "7178600000881",
    "caseBarcode": "7178600001307",
    "description": "Premium pureed fresh garlic. Perfect for quick cooking, marinades, or mixing into sauces.",
    "image": "extracted_p12_img1.png",
    "spiciness": "none",
    "dietary": ["Vegetarian", "Vegan", "Gluten Free"]
  },
  {
    "name": "Pasta Roma Tomato & Chilli",
    "category": "retail",
    "rangeType": "Pasta Roma Range",
    "size": "350G",
    "productCode": "PR101",
    "unitBarcode": "5202000110122",
    "caseBarcode": "5202000500114",
    "description": "Authentic Italian flavour at home. A quick and easy tomato pasta sauce with a red chilli kick.",
    "image": "extracted_p14_img1.png",
    "spiciness": "mild",
    "dietary": ["Vegetarian", "Vegan", "Gluten Free"]
  },
  {
    "name": "Al Rifai Apricot and Coriander Tagine Sauce",
    "category": "retail",
    "rangeType": "Al Rifai Range",
    "size": "350G",
    "productCode": "AR201",
    "unitBarcode": "AR-U-01",
    "caseBarcode": "AR-C-01",
    "description": "Moroccan sweet and savoury tagine sauce featuring real apricots, honey, and fresh coriander.",
    "image": "extracted_p16_img1.png",
    "spiciness": "mild",
    "dietary": ["Vegetarian", "Vegan", "Gluten Free"]
  },
  {
    "name": "Yellow River Chinese Curry Sauce",
    "category": "retail",
    "rangeType": "Yellow River Range",
    "size": "350G",
    "productCode": "YR301",
    "unitBarcode": "5025567100203",
    "caseBarcode": "YR-C-01",
    "description": "Bring bold, comforting Chinese curry flavors home. Thick, aromatic, with subtle sweet soy hints.",
    "image": "extracted_p18_img1.png",
    "spiciness": "mild",
    "dietary": ["Vegetarian", "Vegan", "Gluten Free"]
  },
  {
    "name": "NYC Chilli Sauce",
    "category": "foodservice",
    "rangeType": "NYC Range",
    "size": "2.28KG",
    "productCode": "NYC003",
    "unitBarcode": "5202000100024",
    "caseBarcode": "5202000400025",
    "description": "Our NYC foodservice condiments range. A thick, smoky hot chili sauce tailored for grills, wings, and street food.",
    "image": "extracted_p26_img1.png",
    "spiciness": "hot",
    "dietary": ["Vegetarian", "Vegan", "Gluten Free"]
  }
];

export default App;
