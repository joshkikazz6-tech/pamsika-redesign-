import React, { useState } from 'react';
import { Product, OrderItem, SellerProfile, PendingProductApproval } from '../types';

interface AdminViewProps {
  products?: Product[];
  orders: OrderItem[];
  sellers: SellerProfile[];
  pendingApprovals: PendingProductApproval[];
  onApproveProduct: (approvalId: string) => void;
  onRejectProduct: (approvalId: string) => void;
  onToggleOrderDone: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onToggleSellerStatus: (sellerId: string, status: SellerProfile['status']) => void;
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
  onEditProduct?: (updatedProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (view: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products = [],
  orders,
  sellers,
  pendingApprovals,
  onApproveProduct,
  onRejectProduct,
  onToggleOrderDone,
  onCancelOrder,
  onToggleSellerStatus,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onShowToast,
  onNavigate
}) => {
  const [activeNav, setActiveNav] = useState<
    'home' | 'overview' | 'orders' | 'sellers' | 'approvals' | 'products' | 'affiliates' | 'withdrawals' | 'users' | 'promos' | 'notify' | 'inbox'
  >('overview');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Products Management State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productSort, setProductSort] = useState<'newest' | 'price-low' | 'price-high' | 'stock-low'>('newest');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'table'>('grid');

  // Product Modals State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form State for Adding / Editing Product
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'Fashion' as Product['category'],
    price: '',
    currency: 'MWK' as 'MWK' | 'USD',
    image: '',
    description: '',
    sellerName: 'Pa_mSikA Verified Direct',
    stock: '10',
    badge: '' as Product['badge'] | '',
    commission: '5'
  });

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      category: 'Fashion',
      price: '',
      currency: 'MWK',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: '',
      sellerName: 'Pa_mSikA Verified Direct',
      stock: '10',
      badge: '',
      commission: '5'
    });
  };

  const openAddProductModal = () => {
    resetProductForm();
    setIsAddProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      category: prod.category || 'Fashion',
      price: prod.price.toString(),
      currency: prod.currency || 'MWK',
      image: prod.image || '',
      description: prod.description || '',
      sellerName: prod.sellerName || 'Verified Merchant',
      stock: (prod.stock ?? 10).toString(),
      badge: prod.badge || '',
      commission: (prod.commission ?? 5).toString()
    });
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name.trim()) {
      onShowToast('Product name is required!');
      return;
    }
    const numPrice = parseFloat(productFormData.price) || 0;
    if (numPrice <= 0) {
      onShowToast('Please enter a valid price');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
    const finalImg = productFormData.image.trim() || defaultImg;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: productFormData.name.trim(),
        category: productFormData.category,
        price: numPrice,
        currency: productFormData.currency,
        image: finalImg,
        description: productFormData.description.trim(),
        sellerName: productFormData.sellerName.trim() || 'Verified Merchant',
        stock: parseInt(productFormData.stock) || 0,
        badge: productFormData.badge ? (productFormData.badge as Product['badge']) : undefined,
        commission: parseFloat(productFormData.commission) || 5
      };

      if (onEditProduct) {
        onEditProduct(updated);
      }
      onShowToast(`Updated product "${updated.name}"`);
      setEditingProduct(null);
    } else {
      const newProdData: Omit<Product, 'id'> = {
        name: productFormData.name.trim(),
        category: productFormData.category,
        price: numPrice,
        currency: productFormData.currency,
        image: finalImg,
        description: productFormData.description.trim(),
        sellerName: productFormData.sellerName.trim() || 'Pa_mSikA Verified Direct',
        sellerVerified: true,
        stock: parseInt(productFormData.stock) || 10,
        badge: productFormData.badge ? (productFormData.badge as Product['badge']) : undefined,
        commission: parseFloat(productFormData.commission) || 5,
        likesCount: 0,
        viewsCount: 1,
        status: 'Approved'
      };

      if (onAddProduct) {
        onAddProduct(newProdData);
      }
      onShowToast(`Uploaded new product "${newProdData.name}"!`);
      setIsAddProductModalOpen(false);
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (!deletingProduct) return;
    if (onDeleteProduct) {
      onDeleteProduct(deletingProduct.id);
    }
    onShowToast(`Deleted "${deletingProduct.name}" from marketplace`);
    setDeletingProduct(null);
  };

  const samplePresets = [
    { label: 'Leather Bifold', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
    { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
    { label: 'Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
    { label: 'Luxury Handbag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80' },
    { label: 'Automobile', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProductFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Approval filter states
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalCategory, setApprovalCategory] = useState('ALL');
  const [approvalSort, setApprovalSort] = useState<'oldest' | 'newest'>('oldest');

  // Seller filter states
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'ALL' | 'Active' | 'Pending' | 'Suspended'>('ALL');

  // ==================== AFFILIATE MANAGEMENT STATE ====================
  const [affiliateSubTab, setAffiliateSubTab] = useState<'total-affiliates' | 'commission-paid' | 'pending-withdrawals' | 'clicks-traffic'>('total-affiliates');
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [affiliateTierFilter, setAffiliateTierFilter] = useState('ALL');

  // Affiliates Full Dataset State
  const [affiliatesList, setAffiliatesList] = useState([
    {
      id: 'AFF-1001',
      name: 'Limbani Phiri',
      phone: '+265 991 234 567',
      email: 'limbani.phiri@gmail.com',
      location: 'Blantyre',
      doloCode: 'DOLO-LMB-88',
      joinedDate: '2025-01-12',
      tier: 'Tier 1 Ambassador',
      subInvites: 14,
      totalSalesGenerated: 12450000,
      totalCommissionEarned: 622500,
      totalWithdrawn: 500000,
      currentBalance: 122500,
      payoutAccount: 'Airtel Money (0991234567)',
      status: 'Active'
    },
    {
      id: 'AFF-1002',
      name: 'Chisomo Banda',
      phone: '+265 882 345 678',
      email: 'chisomo.b@yahoo.com',
      location: 'Lilongwe',
      doloCode: 'DOLO-CSM-42',
      joinedDate: '2025-02-03',
      tier: 'Tier 2 Promoter',
      subInvites: 8,
      totalSalesGenerated: 8200000,
      totalCommissionEarned: 410000,
      totalWithdrawn: 350000,
      currentBalance: 60000,
      payoutAccount: 'TNM Mpamba (0882345678)',
      status: 'Active'
    },
    {
      id: 'AFF-1003',
      name: 'Kondwani Mwale',
      phone: '+265 995 876 543',
      email: 'kondwani.mwale@outlook.com',
      location: 'Mzuzu',
      doloCode: 'DOLO-KND-91',
      joinedDate: '2025-03-18',
      tier: 'VIP Influencer',
      subInvites: 22,
      totalSalesGenerated: 18900000,
      totalCommissionEarned: 945000,
      totalWithdrawn: 800000,
      currentBalance: 145000,
      payoutAccount: 'National Bank (Acc: 100392812)',
      status: 'VIP'
    },
    {
      id: 'AFF-1004',
      name: 'Tiwonge Nyirenda',
      phone: '+265 888 112 233',
      email: 'tiwonge.n@gmail.com',
      location: 'Zomba',
      doloCode: 'DOLO-TWG-15',
      joinedDate: '2025-04-29',
      tier: 'Tier 1 Ambassador',
      subInvites: 5,
      totalSalesGenerated: 4100000,
      totalCommissionEarned: 205000,
      totalWithdrawn: 150000,
      currentBalance: 55000,
      payoutAccount: 'Airtel Money (0888112233)',
      status: 'Active'
    },
    {
      id: 'AFF-1005',
      name: 'Blessings Kaima',
      phone: '+265 999 445 566',
      email: 'kaima.blessings@gmail.com',
      location: 'Lilongwe',
      doloCode: 'DOLO-BLS-19',
      joinedDate: '2025-05-14',
      tier: 'VIP Influencer',
      subInvites: 19,
      totalSalesGenerated: 15300000,
      totalCommissionEarned: 765000,
      totalWithdrawn: 700000,
      currentBalance: 65000,
      payoutAccount: 'Airtel Money (0999445566)',
      status: 'VIP'
    },
    {
      id: 'AFF-1006',
      name: 'Memory Tembo',
      phone: '+265 881 778 899',
      email: 'memory.tembo@hotmail.com',
      location: 'Kasungu',
      doloCode: 'DOLO-MEM-07',
      joinedDate: '2025-06-01',
      tier: 'Tier 2 Promoter',
      subInvites: 3,
      totalSalesGenerated: 2800000,
      totalCommissionEarned: 140000,
      totalWithdrawn: 100000,
      currentBalance: 40000,
      payoutAccount: 'TNM Mpamba (0881778899)',
      status: 'Active'
    },
    {
      id: 'AFF-1007',
      name: 'Yamikani Mhango',
      phone: '+265 993 332 211',
      email: 'yamikani.mhango@gmail.com',
      location: 'Blantyre',
      doloCode: 'DOLO-YMK-33',
      joinedDate: '2025-06-19',
      tier: 'Tier 1 Ambassador',
      subInvites: 11,
      totalSalesGenerated: 9600000,
      totalCommissionEarned: 480000,
      totalWithdrawn: 400000,
      currentBalance: 80000,
      payoutAccount: 'Standard Bank (Acc: 910023812)',
      status: 'Active'
    },
    {
      id: 'AFF-1008',
      name: 'Zikomo Gondwe',
      phone: '+265 884 556 677',
      email: 'zikomo.gondwe@gmail.com',
      location: 'Mangochi',
      doloCode: 'DOLO-ZKM-55',
      joinedDate: '2025-07-02',
      tier: 'Tier 2 Promoter',
      subInvites: 7,
      totalSalesGenerated: 6100000,
      totalCommissionEarned: 305000,
      totalWithdrawn: 250000,
      currentBalance: 55000,
      payoutAccount: 'TNM Mpamba (0884556677)',
      status: 'Active'
    }
  ]);

  // Commission Paid Log State
  const [commissionPaidList, setCommissionPaidList] = useState([
    {
      id: 'PAY-9001',
      date: '2026-07-25 16:45',
      affiliateId: 'AFF-1003',
      affiliateName: 'Kondwani Mwale',
      phone: '+265 995 876 543',
      payoutChannel: 'National Bank',
      accountDetails: 'Acc: 100392812',
      amountPaid: 250000,
      transactionRef: 'NBM-EFT-991023',
      salesPeriod: 'July 2026 Mid-Month Payout',
      disbursedBy: 'Admin (SuperAdmin)',
      status: 'Completed'
    },
    {
      id: 'PAY-9002',
      date: '2026-07-22 11:20',
      affiliateId: 'AFF-1001',
      affiliateName: 'Limbani Phiri',
      phone: '+265 991 234 567',
      payoutChannel: 'Airtel Money',
      accountDetails: '0991234567',
      amountPaid: 200000,
      transactionRef: 'TXN-AIR-882190',
      salesPeriod: 'July Week 2 Settlement',
      disbursedBy: 'Admin (SuperAdmin)',
      status: 'Completed'
    },
    {
      id: 'PAY-9003',
      date: '2026-07-19 09:15',
      affiliateId: 'AFF-1005',
      affiliateName: 'Blessings Kaima',
      phone: '+265 999 445 566',
      payoutChannel: 'Airtel Money',
      accountDetails: '0999445566',
      amountPaid: 350000,
      transactionRef: 'TXN-AIR-771029',
      salesPeriod: 'July Week 1 Commission',
      disbursedBy: 'Admin (SuperAdmin)',
      status: 'Completed'
    },
    {
      id: 'PAY-9004',
      date: '2026-07-15 14:00',
      affiliateId: 'AFF-1002',
      affiliateName: 'Chisomo Banda',
      phone: '+265 882 345 678',
      payoutChannel: 'TNM Mpamba',
      accountDetails: '0882345678',
      amountPaid: 150000,
      transactionRef: 'TXN-MPM-391204',
      salesPeriod: 'June 2026 End-Month Settlement',
      disbursedBy: 'Admin (Finance)',
      status: 'Completed'
    },
    {
      id: 'PAY-9005',
      date: '2026-07-10 10:30',
      affiliateId: 'AFF-1007',
      affiliateName: 'Yamikani Mhango',
      phone: '+265 993 332 211',
      payoutChannel: 'Standard Bank',
      accountDetails: 'Acc: 910023812',
      amountPaid: 200000,
      transactionRef: 'STB-EFT-401928',
      salesPeriod: 'June 2026 Mid-Month Payout',
      disbursedBy: 'Admin (Finance)',
      status: 'Completed'
    },
    {
      id: 'PAY-9006',
      date: '2026-07-05 15:10',
      affiliateId: 'AFF-1008',
      affiliateName: 'Zikomo Gondwe',
      phone: '+265 884 556 677',
      payoutChannel: 'TNM Mpamba',
      accountDetails: '0884556677',
      amountPaid: 120000,
      transactionRef: 'TXN-MPM-102938',
      salesPeriod: 'June Week 1 Payout',
      disbursedBy: 'Admin (SuperAdmin)',
      status: 'Completed'
    }
  ]);

  // Affiliate Withdrawals Requests State
  const [affiliateWithdrawalsList, setAffiliateWithdrawalsList] = useState([
    {
      id: 'WTH-801',
      requestDate: '2026-07-26 18:10',
      affiliateId: 'AFF-1001',
      affiliateName: 'Limbani Phiri',
      phone: '+265 991 234 567',
      payoutMethod: 'Airtel Money',
      accountNumber: '0991234567',
      availableBalance: 122500,
      requestedAmount: 100000,
      status: 'Pending Approval'
    },
    {
      id: 'WTH-802',
      requestDate: '2026-07-26 14:25',
      affiliateId: 'AFF-1002',
      affiliateName: 'Chisomo Banda',
      phone: '+265 882 345 678',
      payoutMethod: 'TNM Mpamba',
      accountNumber: '0882345678',
      availableBalance: 60000,
      requestedAmount: 50000,
      status: 'Pending Approval'
    },
    {
      id: 'WTH-803',
      requestDate: '2026-07-25 20:00',
      affiliateId: 'AFF-1006',
      affiliateName: 'Memory Tembo',
      phone: '+265 881 778 899',
      payoutMethod: 'TNM Mpamba',
      accountNumber: '0881778899',
      availableBalance: 40000,
      requestedAmount: 35000,
      status: 'Pending Approval'
    },
    {
      id: 'WTH-804',
      requestDate: '2026-07-25 09:30',
      affiliateId: 'AFF-1007',
      affiliateName: 'Yamikani Mhango',
      phone: '+265 993 332 211',
      payoutMethod: 'Standard Bank',
      accountNumber: 'Acc: 910023812',
      availableBalance: 80000,
      requestedAmount: 75000,
      status: 'Approved'
    }
  ]);

  // Clicks & Traffic Log State
  const [clickLogsList, setClickLogsList] = useState([
    {
      id: 'CLK-301',
      date: '2026-07-27 01:15',
      affiliateName: 'Blessings Kaima',
      doloCode: 'DOLO-BLS-19',
      productName: 'Toyota Ractis 2016',
      trafficSource: 'WhatsApp Group Share',
      converted: true,
      commissionEarned: 15000
    },
    {
      id: 'CLK-302',
      date: '2026-07-27 00:42',
      affiliateName: 'Kondwani Mwale',
      doloCode: 'DOLO-KND-91',
      productName: 'Leather Bifold Wallet - Cognac',
      trafficSource: 'Facebook Ad Link',
      converted: true,
      commissionEarned: 4500
    },
    {
      id: 'CLK-303',
      date: '2026-07-26 23:10',
      affiliateName: 'Limbani Phiri',
      doloCode: 'DOLO-LMB-88',
      productName: 'Nike Air Max Sneakers',
      trafficSource: 'Instagram Bio Link',
      converted: false,
      commissionEarned: 0
    },
    {
      id: 'CLK-304',
      date: '2026-07-26 21:55',
      affiliateName: 'Chisomo Banda',
      doloCode: 'DOLO-CSM-42',
      productName: 'Smart Watch Series 8',
      trafficSource: 'WhatsApp Direct Msg',
      converted: true,
      commissionEarned: 7500
    },
    {
      id: 'CLK-305',
      date: '2026-07-26 19:30',
      affiliateName: 'Tiwonge Nyirenda',
      doloCode: 'DOLO-TWG-15',
      productName: 'Mechanical Gaming Keyboard',
      trafficSource: 'Twitter Post Link',
      converted: false,
      commissionEarned: 0
    }
  ]);

  // ==================== MAIN WITHDRAWALS MANAGEMENT STATE ====================
  const [withdrawalsSearch, setWithdrawalsSearch] = useState('');
  const [withdrawalsTypeFilter, setWithdrawalsTypeFilter] = useState<'ALL' | 'Seller' | 'Affiliate'>('ALL');
  const [withdrawalsStatusFilter, setWithdrawalsStatusFilter] = useState<'ALL' | 'Pending Approval' | 'Disbursed' | 'Rejected'>('ALL');
  const [withdrawalsMainList, setWithdrawalsMainList] = useState([
    {
      id: 'WTH-901',
      type: 'Affiliate' as 'Affiliate' | 'Seller',
      requesterName: 'Limbani Phiri',
      phone: '+265 991 234 567',
      payoutMethod: 'Airtel Money',
      accountNumber: '0991234567',
      availableBalance: 122500,
      requestedAmount: 100000,
      requestDate: '2026-07-27 01:20',
      status: 'Pending Approval' as 'Pending Approval' | 'Disbursed' | 'Rejected',
      notes: 'Weekly commission cashout request'
    },
    {
      id: 'WTH-902',
      type: 'Seller' as 'Affiliate' | 'Seller',
      requesterName: 'Kwatcha Electronics (Funsani Banda)',
      phone: '+265 882 345 678',
      payoutMethod: 'TNM Mpamba',
      accountNumber: '0882345678',
      availableBalance: 350000,
      requestedAmount: 250000,
      requestDate: '2026-07-26 19:45',
      status: 'Pending Approval' as 'Pending Approval' | 'Disbursed' | 'Rejected',
      notes: 'Order #ORD-8821 payout settlement'
    },
    {
      id: 'WTH-903',
      type: 'Affiliate' as 'Affiliate' | 'Seller',
      requesterName: 'Memory Tembo',
      phone: '+265 881 778 899',
      payoutMethod: 'TNM Mpamba',
      accountNumber: '0881778899',
      availableBalance: 40000,
      requestedAmount: 35000,
      requestDate: '2026-07-26 14:10',
      status: 'Pending Approval' as 'Pending Approval' | 'Disbursed' | 'Rejected',
      notes: 'Promoter earnings withdrawal'
    },
    {
      id: 'WTH-904',
      type: 'Seller' as 'Affiliate' | 'Seller',
      requesterName: 'Blantyre Luxury Boutique',
      phone: '+265 993 332 211',
      payoutMethod: 'Standard Bank',
      accountNumber: 'Acc: 910023812',
      availableBalance: 820000,
      requestedAmount: 500000,
      requestDate: '2026-07-25 11:30',
      status: 'Disbursed' as 'Pending Approval' | 'Disbursed' | 'Rejected',
      notes: 'Approved by SuperAdmin - Ref: STB-EFT-9910'
    },
    {
      id: 'WTH-905',
      type: 'Affiliate' as 'Affiliate' | 'Seller',
      requesterName: 'Kondwani Mwale',
      phone: '+265 995 876 543',
      payoutMethod: 'National Bank',
      accountNumber: 'Acc: 100392812',
      availableBalance: 145000,
      requestedAmount: 100000,
      requestDate: '2026-07-25 09:15',
      status: 'Disbursed' as 'Pending Approval' | 'Disbursed' | 'Rejected',
      notes: 'Disbursed via EFT - Ref: NBM-49102'
    },
    {
      id: 'WTH-906',
      type: 'Seller' as 'Affiliate' | 'Seller',
      requesterName: 'Lilongwe Auto Imports',
      phone: '+265 999 445 566',
      payoutMethod: 'Airtel Money',
      accountNumber: '0999445566',
      availableBalance: 1200000,
      requestedAmount: 850000,
      requestDate: '2026-07-24 16:50',
      status: 'Pending Approval' as 'Pending Approval' | 'Disbursed' | 'Rejected',
      notes: 'Car sale escrow release'
    }
  ]);

  // ==================== PROMOTIONS & VOUCHERS STATE ====================
  const [promosSearch, setPromosSearch] = useState('');
  const [promosStatusFilter, setPromosStatusFilter] = useState<'ALL' | 'Active' | 'Paused' | 'Expired'>('ALL');
  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    title: '',
    type: 'percentage' as 'percentage' | 'fixed',
    discountValue: '10',
    minSpend: '10000',
    maxUsage: '200',
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: '2026-12-31',
    applicableCategory: 'All Products',
    description: ''
  });

  const [promosList, setPromosList] = useState([
    {
      id: 'PRM-101',
      code: 'PA_MSIKA_10',
      title: '10% Off Welcome Discount',
      type: 'percentage' as 'percentage' | 'fixed',
      discountValue: 10,
      minSpend: 20000,
      maxUsage: 500,
      usedCount: 142,
      startDate: '2026-07-01',
      expiryDate: '2026-08-31',
      applicableCategory: 'All Products',
      status: 'Active' as 'Active' | 'Paused' | 'Expired',
      description: 'Special 10% promotional discount for new Pa_mSika buyers.'
    },
    {
      id: 'PRM-102',
      code: 'DOLO5000',
      title: 'MWK 5,000 Off Electronics',
      type: 'fixed' as 'percentage' | 'fixed',
      discountValue: 5000,
      minSpend: 50000,
      maxUsage: 200,
      usedCount: 89,
      startDate: '2026-07-15',
      expiryDate: '2026-08-15',
      applicableCategory: 'Electronics',
      status: 'Active' as 'Active' | 'Paused' | 'Expired',
      description: 'Flat MWK 5,000 off on all verified phones and laptops.'
    },
    {
      id: 'PRM-103',
      code: 'FASHION20',
      title: '20% Off Luxury Fashion & Bags',
      type: 'percentage' as 'percentage' | 'fixed',
      discountValue: 20,
      minSpend: 15000,
      maxUsage: 300,
      usedCount: 300,
      startDate: '2026-06-01',
      expiryDate: '2026-07-01',
      applicableCategory: 'Fashion',
      status: 'Expired' as 'Active' | 'Paused' | 'Expired',
      description: 'Mid-year fashion promo for clothing, footwear, and luxury bags.'
    },
    {
      id: 'PRM-104',
      code: 'AUTO100K',
      title: 'MWK 100,000 Off Verified Automobiles',
      type: 'fixed' as 'percentage' | 'fixed',
      discountValue: 100000,
      minSpend: 2000000,
      maxUsage: 50,
      usedCount: 12,
      startDate: '2026-07-10',
      expiryDate: '2026-09-30',
      applicableCategory: 'Automobiles',
      status: 'Active' as 'Active' | 'Paused' | 'Expired',
      description: 'Exclusive buyer voucher for certified Toyota & Mazda vehicles.'
    }
  ]);

  // ==================== INBOX / MESSAGES STATE ====================
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxRoleFilter, setInboxRoleFilter] = useState<'ALL' | 'Unread' | 'Seller' | 'Buyer' | 'Affiliate'>('ALL');
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<any>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');

  const [inboxList, setInboxList] = useState([
    {
      id: 'MSG-401',
      senderName: 'Funsani Banda (Kwatcha Electronics)',
      senderRole: 'Seller' as 'Seller' | 'Buyer' | 'Affiliate',
      phone: '+265 882 345 678',
      email: 'kwatcha.electronics@gmail.com',
      category: 'Verification',
      subject: 'Request for Merchant Verification Badge Upgrade',
      message: 'Hello Admin, I have submitted my Business Registration certificate and National ID copy. Please review and verify my store account so I can start posting high-value laptops.',
      timestamp: '2026-07-27 01:45',
      isRead: false,
      status: 'Open' as 'Open' | 'In Progress' | 'Resolved',
      priority: 'High' as 'High' | 'Medium' | 'Normal' | 'Urgent',
      replies: [
        { sender: 'Funsani Banda', text: 'Attached my documents to my seller profile.', time: '2026-07-27 01:45' }
      ]
    },
    {
      id: 'MSG-402',
      senderName: 'Limbani Phiri',
      senderRole: 'Affiliate' as 'Seller' | 'Buyer' | 'Affiliate',
      phone: '+265 991 234 567',
      email: 'limbani.phiri@gmail.com',
      category: 'Commission Inquiry',
      subject: 'Withdrawal Approval Status for Request #WTH-901',
      message: 'Hi Admin, I requested MWK 100,000 withdrawal yesterday to Airtel Money. Could you please check when it will be processed? Thank you!',
      timestamp: '2026-07-26 21:10',
      isRead: false,
      status: 'Open' as 'Open' | 'In Progress' | 'Resolved',
      priority: 'Medium' as 'High' | 'Medium' | 'Normal' | 'Urgent',
      replies: []
    },
    {
      id: 'MSG-403',
      senderName: 'Chifundo Mvula',
      senderRole: 'Buyer' as 'Seller' | 'Buyer' | 'Affiliate',
      phone: '+265 999 112 233',
      email: 'chifundo.mvula@yahoo.com',
      category: 'Order Dispute',
      subject: 'Non-delivery of Smart Watch Order #ORD-8820',
      message: 'Good day. I paid for a Smart Watch 3 days ago but the seller has not dispatched the item yet. Please assist me with escrow refund or contact the seller.',
      timestamp: '2026-07-26 16:30',
      isRead: true,
      status: 'In Progress' as 'Open' | 'In Progress' | 'Resolved',
      priority: 'Urgent' as 'High' | 'Medium' | 'Normal' | 'Urgent',
      replies: [
        { sender: 'Admin Support', text: 'We have contacted the seller to dispatch immediately or trigger a full refund.', time: '2026-07-26 17:00' }
      ]
    },
    {
      id: 'MSG-404',
      senderName: 'Blantyre Luxury Boutique',
      senderRole: 'Seller' as 'Seller' | 'Buyer' | 'Affiliate',
      phone: '+265 993 332 211',
      email: 'contact@blantyereluxury.mw',
      category: 'Product Approval',
      subject: 'Listing Approval for Designer Leather Handbags',
      message: 'Greetings! We uploaded 5 new luxury leather bags. Kindly inspect and approve them for public listing on the homepage.',
      timestamp: '2026-07-25 14:00',
      isRead: true,
      status: 'Resolved' as 'Open' | 'In Progress' | 'Resolved',
      priority: 'Normal' as 'High' | 'Medium' | 'Normal' | 'Urgent',
      replies: [
        { sender: 'Admin Support', text: 'All 5 products have been approved and are now live!', time: '2026-07-25 15:20' }
      ]
    }
  ]);

  // Excel CSV Exporter Utility
  const handleExportToExcel = (
    filename: string,
    headers: string[],
    rows: (string | number)[][]
  ) => {
    const formatCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [
      headers.map(formatCell).join(','),
      ...rows.map((row) => row.map(formatCell).join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`Exported ${filename}.csv successfully!`);
  };

  const handleApproveAffiliateWithdrawal = (wthId: string) => {
    const wth = affiliateWithdrawalsList.find((w) => w.id === wthId);
    if (!wth) return;

    // Create payment log
    const newPayment = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      affiliateId: wth.affiliateId,
      affiliateName: wth.affiliateName,
      phone: wth.phone,
      payoutChannel: wth.payoutMethod,
      accountDetails: wth.accountNumber,
      amountPaid: wth.requestedAmount,
      transactionRef: `TXN-${wth.payoutMethod.toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
      salesPeriod: 'Instant Admin Payout Approval',
      disbursedBy: 'Admin (SuperAdmin)',
      status: 'Completed'
    };

    setCommissionPaidList((prev) => [newPayment, ...prev]);

    // Update withdrawal status
    setAffiliateWithdrawalsList((prev) =>
      prev.map((w) => (w.id === wthId ? { ...w, status: 'Paid' } : w))
    );

    // Update affiliate balance & total withdrawn
    setAffiliatesList((prev) =>
      prev.map((aff) => {
        if (aff.id === wth.affiliateId) {
          const newBal = Math.max(0, aff.currentBalance - wth.requestedAmount);
          const newWithdrawn = aff.totalWithdrawn + wth.requestedAmount;
          return { ...aff, currentBalance: newBal, totalWithdrawn: newWithdrawn };
        }
        return aff;
      })
    );

    onShowToast(`Payout of MWK ${wth.requestedAmount.toLocaleString()} approved for ${wth.affiliateName}!`);
  };

  // Individual Main Withdrawal Approval
  const handleApproveMainWithdrawal = (wthId: string) => {
    const item = withdrawalsMainList.find((w) => w.id === wthId);
    if (!item) return;

    setWithdrawalsMainList((prev) =>
      prev.map((w) =>
        w.id === wthId
          ? {
              ...w,
              status: 'Disbursed',
              notes: `Disbursed individually by Admin on ${new Date().toLocaleDateString()}`
            }
          : w
      )
    );

    onShowToast(`Disbursed MWK ${item.requestedAmount.toLocaleString()} to ${item.requesterName} via ${item.payoutMethod}!`);
  };

  // Individual Main Withdrawal Rejection
  const handleRejectMainWithdrawal = (wthId: string) => {
    const item = withdrawalsMainList.find((w) => w.id === wthId);
    if (!item) return;

    setWithdrawalsMainList((prev) =>
      prev.map((w) =>
        w.id === wthId
          ? {
              ...w,
              status: 'Rejected',
              notes: `Rejected by Admin on ${new Date().toLocaleDateString()}`
            }
          : w
      )
    );

    onShowToast(`Withdrawal request ${wthId} for ${item.requesterName} rejected.`);
  };

  // Promo Save / Edit Handler
  const handleSavePromoForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormData.code || !promoFormData.title) {
      onShowToast('Please fill in required promo code fields.');
      return;
    }

    const cleanCode = promoFormData.code.toUpperCase().replace(/\s+/g, '');

    if (editingPromo) {
      setPromosList((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id
            ? {
                ...p,
                code: cleanCode,
                title: promoFormData.title,
                type: promoFormData.type,
                discountValue: Number(promoFormData.discountValue) || 0,
                minSpend: Number(promoFormData.minSpend) || 0,
                maxUsage: Number(promoFormData.maxUsage) || 100,
                startDate: promoFormData.startDate,
                expiryDate: promoFormData.expiryDate,
                applicableCategory: promoFormData.applicableCategory,
                description: promoFormData.description
              }
            : p
        )
      );
      onShowToast(`Promotion "${cleanCode}" updated successfully!`);
    } else {
      const newPromo = {
        id: `PRM-${Math.floor(100 + Math.random() * 900)}`,
        code: cleanCode,
        title: promoFormData.title,
        type: promoFormData.type,
        discountValue: Number(promoFormData.discountValue) || 0,
        minSpend: Number(promoFormData.minSpend) || 0,
        maxUsage: Number(promoFormData.maxUsage) || 100,
        usedCount: 0,
        startDate: promoFormData.startDate,
        expiryDate: promoFormData.expiryDate,
        applicableCategory: promoFormData.applicableCategory,
        status: 'Active' as const,
        description: promoFormData.description
      };
      setPromosList((prev) => [newPromo, ...prev]);
      onShowToast(`New Promotion "${newPromo.code}" created and activated!`);
    }

    setIsAddPromoModalOpen(false);
    setEditingPromo(null);
  };

  const handleTogglePromoStatus = (promoId: string) => {
    setPromosList((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          const nextStatus = p.status === 'Active' ? 'Paused' : 'Active';
          onShowToast(`Promo ${p.code} status changed to ${nextStatus}.`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleDeletePromo = (promoId: string) => {
    setPromosList((prev) => prev.filter((p) => p.id !== promoId));
    onShowToast(`Promotion removed successfully.`);
  };

  // Inbox Reply & Management Handlers
  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboxMsg || !adminReplyInput.trim()) return;

    const newReply = {
      sender: 'Admin Support',
      text: adminReplyInput.trim(),
      time: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setInboxList((prev) =>
      prev.map((m) => {
        if (m.id === selectedInboxMsg.id) {
          return {
            ...m,
            isRead: true,
            status: 'In Progress',
            replies: [...m.replies, newReply]
          };
        }
        return m;
      })
    );

    setSelectedInboxMsg((prev: any) =>
      prev ? { ...prev, isRead: true, status: 'In Progress', replies: [...prev.replies, newReply] } : null
    );

    setAdminReplyInput('');
    onShowToast(`Reply sent to ${selectedInboxMsg.senderName}!`);
  };

  const handleToggleReadStatus = (msgId: string) => {
    setInboxList((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isRead: !m.isRead } : m))
    );
  };

  const handleResolveMessage = (msgId: string) => {
    setInboxList((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: 'Resolved', isRead: true } : m))
    );
    if (selectedInboxMsg && selectedInboxMsg.id === msgId) {
      setSelectedInboxMsg((prev: any) => (prev ? { ...prev, status: 'Resolved', isRead: true } : null));
    }
    onShowToast('Support ticket marked as Resolved.');
  };

  const handleDeleteMessage = (msgId: string) => {
    setInboxList((prev) => prev.filter((m) => m.id !== msgId));
    if (selectedInboxMsg && selectedInboxMsg.id === msgId) {
      setSelectedInboxMsg(null);
    }
    onShowToast('Message deleted.');
  };

  // Business Analytics timeframe state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'30d' | '90d' | '1y'>('30d');

  // Notifications Toggle & List State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'n1',
      title: 'New Product Approval Required',
      desc: 'The Heritage Bifold – Cognac submitted by Aiden Craftworks',
      time: '10m ago',
      unread: true,
      navId: 'approvals'
    },
    {
      id: 'n2',
      title: 'High Volume Withdrawal Request',
      desc: 'Chitipa Farmers Co-op requested payout of MWK 1,250,000',
      time: '45m ago',
      unread: true,
      navId: 'withdrawals'
    },
    {
      id: 'n3',
      title: 'New Seller Registration',
      desc: 'Blantyre Electronics Hub submitted verification docs',
      time: '2h ago',
      unread: true,
      navId: 'sellers'
    },
    {
      id: 'n4',
      title: 'System Health Optimal',
      desc: 'Database response latency operating at peak performance (12ms)',
      time: '5h ago',
      unread: false,
      navId: 'overview'
    }
  ]);

  const unreadCount = notificationsList.filter((n) => n.unread).length;

  // Markup state per product card or global fallback
  const [markupMap, setMarkupMap] = useState<Record<string, { markup: number; comm: number }>>({
    'appr-1': { markup: 25, comm: 10 },
    'appr-2': { markup: 25, comm: 10 },
    'appr-3': { markup: 30, comm: 15 },
  });

  const getMarkup = (id: string) => markupMap[id]?.markup ?? 25;
  const getComm = (id: string) => markupMap[id]?.comm ?? 10;

  const updateMarkup = (id: string, markup: number, comm: number) => {
    setMarkupMap((prev) => ({
      ...prev,
      [id]: { markup, comm }
    }));
  };

  // Sample extended approval items matching the design images if pendingApprovals is low
  const displayApprovals: PendingProductApproval[] = pendingApprovals.length > 0
    ? pendingApprovals
    : [
        {
          id: 'appr-1',
          productName: 'The Heritage Bifold – Cognac',
          category: 'Fashion & Acc.',
          sellerName: 'Aiden Craftworks',
          sellerPrice: 45.00,
          stock: 150,
          submittedTime: '2h ago',
          description: 'Full-grain vegetable tanned leather bifold wallet with RFID blocking technology. Hand-stitched with waxed thread.',
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuD_e_tqTx0_D8kvJ1y2RnvSDhjpIoiZrlpH-gAMlUQPs-uLHDGDGU7I-jovUbgUplxvVoQ42N6jWXDCmMeXd_rQP5Yuw5FXb98X8-HZlBRMYcFb5XfKcb7AHH1vR7Z0HGUxSkClf-yUeikqzMGf9w_bjlKPO59G1eMnAgRoGf2PPX_lvOCnHNefofIgH8Wu1P08Albj1LR_oh_x0qpOiev5MI70v2WPgVsm6XKYMymOcChau83-RIfQdYsu-O7OOIN43JSRRPF2o_g',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBgQsy4vrovhpndJDvbjGYUQ--LmmDOvPLnaKNimKHc-e25IRDLF5MLPekO7QevMqAnwoEJfzwaURABODtWXybVh7pRWsYto2pIQKlzJCLVyWiBIyFOQaAhYVBB5swAdI7Ur8LKUBfqhkqQmejMQ5iSJ8ab2R-7zO9G9a6peySvoyKBRN81u57tT-hZPr4hYNTDmY6ACkGbes8fSqW7Bi2dJ_e4sNUyF_u6b_sYhnsUY1kj8J6xXlSdrLZGVFLeHkWHvOzdsCx1abQ'
          ],
          platformMarkupPct: 25,
          affiliateCommPct: 10
        },
        {
          id: 'appr-2',
          productName: 'Apex TKL Mechanical Keyboard',
          category: 'Tech & Gaming',
          sellerName: 'Vertex Peripheral Lab',
          sellerPrice: 120.00,
          stock: 45,
          submittedTime: '5h ago',
          description: 'Wireless mechanical keyboard with hot-swappable switches, PBT keycaps, and custom RGB backlight profiles.',
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAPCgmIDUWLf_1PEAehr_-Nq5Q8Qp4_H_Z6Et4wGhfCsDPv0hLQ8kJJlgkm3QFf-Z4fCgchv_9Rq3GWOk0WxD93jtEthEX60fGQ8_OfotmQGf_6STUkMn-YoV6Qsc5uxFUeDBuhx3imK_4GFLyZs0z3pMt_kWkvCJWxUfbC6WmAptICzVkAquXI_ek1GlMvPg2nq8IRsLLJsAn10i4Iye3ANBy0njwtFNSfYtPNPQyEnwIrK7Ds63jYLz9eixTGxYKhBREpN_CW3iA'
          ],
          platformMarkupPct: 25,
          affiliateCommPct: 10
        },
        {
          id: 'appr-3',
          productName: 'Midnight Cedar Soy Candle',
          category: 'Home Decor',
          sellerName: 'The Atrium Collection',
          sellerPrice: 18.00,
          stock: 500,
          submittedTime: '12h ago',
          description: 'Hand-poured 100% natural soy wax candle with essential oils of cedarwood, vetiver, and smoked oak.',
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCMKVMyCJBpAQvLgOjAdakIaGh9JUkdOqVPBtsiYfj-CtVv8jjlWASBV7pCooQ2ilOKBP13zauZERjiBLOH54kpjChqKgk2zWvfZsUM2JgnuTOV8McgWyuoxZvlcqO_9a8p8JwiZbxcphRAXVbz8HHNYNU1KrLsb5e7QhbvK0gfbvbgjbB80P2znGff8WhjCSrwcH3TOJN7JFxyoRisBkG1H7gcOq-_LfNE3_OnWNnl2GYZviEh1bQNCozsP9hgZvG81SawaSoHuvE'
          ],
          platformMarkupPct: 30,
          affiliateCommPct: 15
        }
      ];

  const filteredApprovals = displayApprovals.filter((appr) => {
    const matchesSearch =
      appr.productName.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      appr.sellerName.toLowerCase().includes(approvalSearch.toLowerCase());
    const matchesCat =
      approvalCategory === 'ALL' ||
      appr.category.toLowerCase().includes(approvalCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const filteredSellers = sellers.filter((sel) => {
    const matchesSearch =
      sel.storeName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      sel.fullName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      sel.location.toLowerCase().includes(sellerSearch.toLowerCase());
    const matchesStatus =
      sellerStatusFilter === 'ALL' || sel.status === sellerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const allCategoryOptions = [
    'ALL',
    'Automobiles',
    'Fashion',
    'Real Estate',
    'Electronics',
    'Luxury Bags',
    'Footwear',
    'Timepieces',
    'Home Decor',
    'Others'
  ];

  const filteredProductsList = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
      const matchesCat = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (productSort === 'price-low') return a.price - b.price;
      if (productSort === 'price-high') return b.price - a.price;
      if (productSort === 'stock-low') return (a.stock ?? 0) - (b.stock ?? 0);
      return 0;
    });

  const inStockCount = products.filter((p) => (p.stock ?? 1) > 0).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 5).length;
  const totalCatalogValue = products.reduce((acc, p) => acc + p.price * (p.stock ?? 1), 0);

  interface NavMenuItem {
    id: 'home' | 'overview' | 'orders' | 'sellers' | 'approvals' | 'products' | 'affiliates' | 'withdrawals' | 'users' | 'promos' | 'notify' | 'inbox';
    label: string;
    icon: string;
    badge?: number;
  }

  const navMenuItems: NavMenuItem[] = [
    { id: 'home', label: 'STOREFRONT HOME', icon: 'home' },
    { id: 'overview', label: 'OVERVIEW', icon: 'grid_view' },
    { id: 'orders', label: 'ORDERS', icon: 'shopping_cart' },
    { id: 'sellers', label: 'SELLERS', icon: 'store' },
    { id: 'approvals', label: 'APPROVALS', icon: 'verified', badge: displayApprovals.length },
    { id: 'products', label: 'PRODUCTS', icon: 'inventory_2', badge: products.length },
    { id: 'affiliates', label: 'AFFILIATES', icon: 'group' },
    { id: 'withdrawals', label: 'WITHDRAWALS', icon: 'payments', badge: 14 },
    { id: 'users', label: 'USERS', icon: 'person' },
    { id: 'promos', label: 'PROMOS', icon: 'sell' },
    { id: 'notify', label: 'NOTIFY', icon: 'campaign' },
    { id: 'inbox', label: 'INBOX', icon: 'mail' },
  ];

  return (
    <div className="min-h-screen bg-[#fef7ff] text-[#1d1a24] flex font-sans">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-[#ccc3d7]/40 z-50 flex-col pt-6 pb-6 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
        {/* Brand Logo Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <span className="font-serif-source text-2xl font-bold text-[#5300b7] tracking-tight">
            Pa_mSikA
          </span>
          <span className="text-[10px] font-bold text-[#5300b7] bg-[#ebddff] px-2 py-0.5 rounded-full uppercase">
            Admin
          </span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {navMenuItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') {
                    if (onNavigate) {
                      onNavigate('home');
                    } else {
                      onShowToast('Navigating to Marketplace Home');
                    }
                    return;
                  }
                  setActiveNav(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-[#5300b7] text-white shadow-md'
                    : 'text-[#4a4455] hover:bg-[#f3ebf9] hover:text-[#1d1a24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-[#5300b7]' : 'bg-[#5300b7] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Link */}
        <div className="px-4 mt-4 pt-4 border-t border-[#ccc3d7]/30">
          <button
            onClick={() => onShowToast('Logged out of Super Admin Portal')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6] transition-all text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="uppercase tracking-wider">LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <aside className="relative z-10 w-64 bg-white h-full flex flex-col pt-6 pb-6 shadow-2xl overflow-y-auto">
            <div className="px-6 mb-6 flex items-center justify-between">
              <span className="font-serif-source text-2xl font-bold text-[#5300b7]">
                Pa_mSikA
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-[#4a4455] hover:text-[#5300b7]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {navMenuItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'home') {
                        if (onNavigate) {
                          onNavigate('home');
                        } else {
                          onShowToast('Navigating to Marketplace Home');
                        }
                        setMobileSidebarOpen(false);
                        return;
                      }
                      setActiveNav(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-left ${
                      isActive
                        ? 'bg-[#5300b7] text-white shadow-md'
                        : 'text-[#4a4455] hover:bg-[#f3ebf9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span className="uppercase tracking-wider">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isActive ? 'bg-white text-[#5300b7]' : 'bg-[#5300b7] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-40 h-16 bg-[#fef7ff]/90 backdrop-blur-md border-b border-[#ccc3d7]/40 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#5300b7] rounded-xl hover:bg-[#f3ebf9]"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-serif-source text-xl sm:text-2xl font-bold text-[#1d1a24]">
              Admin Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('home');
                } else {
                  onShowToast('Navigating to Storefront Home');
                }
              }}
              className="p-2 text-[#5300b7] hover:bg-[#f3ebf9] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Go to Storefront Home"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="hidden sm:inline">Storefront</span>
            </button>

            {/* Working Notifications Toggle Button & Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
                  notificationsOpen
                    ? 'bg-[#5300b7] text-white shadow-xs'
                    : 'text-[#4a4455] hover:text-[#5300b7] hover:bg-[#f3ebf9]'
                }`}
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Interactive Notifications Popover Menu */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#ccc3d7]/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5300b7] text-[20px]">notifications_active</span>
                      <h4 className="font-serif-source font-bold text-sm text-[#1d1a24]">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-[#5300b7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
                          onShowToast('All notifications marked as read');
                        }}
                        className="text-[11px] font-bold text-[#5300b7] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#ccc3d7]/20">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7b7486]">No notifications right now</div>
                    ) : (
                      notificationsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotificationsList((prev) =>
                              prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                            );
                            setActiveNav(item.navId as any);
                            setNotificationsOpen(false);
                            onShowToast(`Opened: ${item.title}`);
                          }}
                          className={`p-3.5 hover:bg-[#f8f2fc] transition-colors cursor-pointer flex gap-3 items-start ${
                            item.unread ? 'bg-[#fef7ff]' : ''
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              item.unread ? 'bg-[#5300b7]' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-bold truncate ${item.unread ? 'text-[#1d1a24]' : 'text-[#4a4455]'}`}>
                                {item.title}
                              </p>
                              <span className="text-[10px] text-[#7b7486] shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-[#4a4455] line-clamp-2 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-[#fef7ff] border-t border-[#ccc3d7]/30 text-center">
                    <button
                      onClick={() => {
                        setActiveNav('notify');
                        setNotificationsOpen(false);
                      }}
                      className="text-xs font-bold text-[#5300b7] hover:bg-[#f3ebf9] w-full py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View All Broadcasts &amp; Alerts</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Hero Card */}
              <section
                className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCe3W5-52iMPXKPSxyaFnRDl1Mo1tytzSKT7go8Ela-DDWkt0jK4PMThxgIbYMXpXDTYyq4lKdbS6wa3dTr3FOU9BrZ8wiKs7qexpM8CtTwGYeqLLyWPTGr512ylPjGFSUbFfXrEEnbyjVnOWFZvsFaEXQjO6-qiaaSsBm-Yhab6GvC34uUCfCuh5lMWgmFru2KtlZcJhhCFoYC4xoGee1sBa9J8yU-Xw0RDITJlRmKz3I_31nIup284Qgx54SLfTZ5DM48DcuCF3Y')`
                }}
              >
                {/* Dark Purple Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#250059]/95 via-[#5300b7]/85 to-[#250059]/80" />

                <div className="relative z-10 space-y-3 max-w-2xl">
                  <h1 className="font-serif-source text-3xl sm:text-4xl font-bold tracking-tight">
                    Welcome back, Admin.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#dac5ff] leading-relaxed">
                    Here's what's happening today. Your ecosystem is growing at a rate of 12% this week. Review pending approvals to maintain marketplace velocity.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onShowToast('Refreshed real-time analytics!')}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      <span>REFRESH STATS</span>
                    </button>
                    <button
                      onClick={() => setActiveNav('approvals')}
                      className="bg-[#6d28d9] hover:bg-[#5b00c5] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>REVIEW PRODUCT APPROVALS</span>
                    </button>
                    <button
                      onClick={() => setActiveNav('sellers')}
                      className="bg-white text-[#5300b7] hover:bg-[#fef7ff] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      VIEW SELLER APPLICATIONS
                    </button>
                  </div>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[220px] w-full md:w-auto shrink-0 shadow-lg">
                  <span className="text-xs font-bold text-[#dac5ff] uppercase tracking-widest block mb-1">
                    GROSS REVENUE
                  </span>
                  <span className="font-serif-source text-3xl font-bold text-white block">
                    MWK 4.5M
                  </span>
                  <span className="text-[10px] text-[#dac5ff] mt-1 block">+18.2% vs last month</span>
                </div>
              </section>

              {/* 8 KPI Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +18.2%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL REVENUE
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      MWK 4,500,000
                    </span>
                  </div>
                </div>

                {/* Total Users */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Growth
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL USERS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      12,500
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PRODUCTS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      1,240
                    </span>
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      ORDERS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      850
                    </span>
                  </div>
                </div>

                {/* Active Sellers */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">store</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      12 PENDING
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      ACTIVE SELLERS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      430
                    </span>
                  </div>
                </div>

                {/* Total Affiliates */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL AFFILIATES
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      1,024
                    </span>
                  </div>
                </div>

                {/* Product Approvals */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">campaign</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PRODUCT APPROVALS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      28
                    </span>
                  </div>
                </div>

                {/* Pending Withdrawals */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between border-l-4 border-l-[#ba1a1a]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#ffdad6] text-[#ba1a1a] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-white bg-[#ba1a1a] px-2 py-0.5 rounded-full uppercase">
                      URGENT
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PENDING WITHDRAWALS
                    </span>
                    <span className="font-serif-source text-2xl font-bold text-[#ba1a1a]">
                      14
                    </span>
                  </div>
                </div>
              </div>

              {/* System Health & Traffic + Recent Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Graph Box */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif-source text-xl font-bold text-[#1d1a24]">
                      System Health &amp; Traffic
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#4a4455]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5300b7]"></span> Sellers
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5c6c8]"></span> Users
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Chart mockup */}
                  <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-[#ccc3d7]/30">
                    {[65, 40, 85, 55, 75, 45, 90, 60, 95].map((val, idx) => (
                      <div key={idx} className="flex-1 flex items-end justify-center gap-1 h-full">
                        <div
                          style={{ height: `${val}%` }}
                          className="w-full max-w-[18px] bg-[#ebddff] hover:bg-[#5300b7] transition-all rounded-t-lg"
                          title={`Sellers Activity: ${val}%`}
                        />
                        <div
                          style={{ height: `${Math.max(20, val - 20)}%` }}
                          className="w-full max-w-[12px] bg-[#f3ebf9] rounded-t-lg"
                          title={`Users Activity: ${val - 20}%`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Alerts Feed */}
                <div className="bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-source text-xl font-bold text-[#1d1a24] mb-4">
                      Recent Alerts
                    </h3>
                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0"></span>
                        <div>
                          <p className="font-bold text-[#1d1a24]">New Withdrawal Request</p>
                          <p className="text-[#4a4455]">MWK 150,000 from Seller #402</p>
                          <span className="text-[10px] text-purple-700 font-semibold">2 mins ago</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#5300b7] mt-1.5 shrink-0"></span>
                        <div>
                          <p className="font-bold text-[#1d1a24]">Seller Application</p>
                          <p className="text-[#4a4455]">"TechHub Malawi" is requesting access</p>
                          <span className="text-[10px] text-[#7b7486]">15 mins ago</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#7b7486] mt-1.5 shrink-0"></span>
                        <div>
                          <p className="font-bold text-[#1d1a24]">Bulk Product Import</p>
                          <p className="text-[#4a4455]">Completed 1,200 entries</p>
                          <span className="text-[10px] text-[#7b7486]">1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onShowToast('Audit Logs exported!')}
                    className="w-full py-2.5 rounded-xl border border-[#ccc3d7] text-[#5300b7] font-bold text-xs hover:bg-[#f3ebf9] transition-colors cursor-pointer"
                  >
                    VIEW ALL AUDIT LOGS
                  </button>
                </div>
              </div>

              {/* Business Analysis & Growth Analytics Section */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ccc3d7]/40 shadow-xs space-y-6">
                {/* Header & Timeframe Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ccc3d7]/30">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        BUSINESS GROWING (+24.8% YoY)
                      </span>
                    </div>
                    <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      Business Performance &amp; Consumer Analytics
                    </h3>
                    <p className="text-xs text-[#4a4455] mt-0.5">
                      Tracking overall revenue trajectory alongside user browsing intent vs. actual purchases
                    </p>
                  </div>

                  {/* Timeframe Buttons */}
                  <div className="flex items-center gap-1.5 bg-[#f3ebf9] p-1 rounded-xl self-start sm:self-auto">
                    {(['30d', '90d', '1y'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setAnalyticsTimeframe(period)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          analyticsTimeframe === period
                            ? 'bg-[#5300b7] text-white shadow-xs'
                            : 'text-[#4a4455] hover:text-[#5300b7]'
                        }`}
                      >
                        {period === '30d' ? '30 Days' : period === '90d' ? '3 Months' : '1 Year'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Metric Highlights Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#fef7ff] p-4 rounded-2xl border border-[#ebddff]">
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Revenue Trajectory
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#5300b7]">
                      {analyticsTimeframe === '30d' ? 'MWK 4,500,000' : analyticsTimeframe === '90d' ? 'MWK 12,800,000' : 'MWK 48,200,000'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">+18.2% vs prev period</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Total Product Views
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      {analyticsTimeframe === '30d' ? '128,400' : analyticsTimeframe === '90d' ? '382,000' : '1,450,000'}
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold block">+32.5% browsing interest</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Completed Purchases
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      {analyticsTimeframe === '30d' ? '850 Orders' : analyticsTimeframe === '90d' ? '2,420 Orders' : '9,810 Orders'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">+14.1% completed checkouts</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider block">
                      Avg Conversion Rate
                    </span>
                    <span className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      6.61%
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold block">Strong commercial intent</span>
                  </div>
                </div>

                {/* Main Line Graph Component */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#4a4455]">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#5300b7]">show_chart</span>
                      Business Growth Line Graph
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-[#5300b7] rounded-full inline-block"></span>
                        <span className="text-[#5300b7]">Revenue Growth (MWK)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-[#10b981] rounded-full inline-block"></span>
                        <span className="text-[#10b981]">Product Views (Interest)</span>
                      </span>
                    </div>
                  </div>

                  {/* SVG Line Graph */}
                  <div className="relative w-full overflow-x-auto bg-[#faf8fc] p-4 sm:p-6 rounded-2xl border border-[#ccc3d7]/30">
                    <svg viewBox="0 0 800 240" className="w-full h-60 min-w-[620px]" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revenueGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5300b7" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#5300b7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      <line x1="40" y1="30" x2="760" y2="30" stroke="#e5e7eb" strokeDasharray="4 4" />
                      <line x1="40" y1="80" x2="760" y2="80" stroke="#e5e7eb" strokeDasharray="4 4" />
                      <line x1="40" y1="130" x2="760" y2="130" stroke="#e5e7eb" strokeDasharray="4 4" />
                      <line x1="40" y1="180" x2="760" y2="180" stroke="#e5e7eb" strokeDasharray="4 4" />

                      {/* Area Fill under Revenue Line */}
                      <path
                        d="M 60,180 Q 170,160 280,120 T 500,80 T 740,35 L 740,195 L 60,195 Z"
                        fill="url(#revenueGrowthGrad)"
                      />

                      {/* Revenue Growth Smooth Vector Line */}
                      <path
                        d="M 60,180 Q 170,160 280,120 T 500,80 T 740,35"
                        fill="none"
                        stroke="#5300b7"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      {/* Product Views Line */}
                      <path
                        d="M 60,190 Q 170,140 280,110 T 500,65 T 740,25"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                      />

                      {/* Data Points & Tooltips */}
                      {[
                        { x: 60, y: 180, rev: 'MWK 1.2M', label: analyticsTimeframe === '30d' ? 'Wk 1' : analyticsTimeframe === '90d' ? 'Month 1' : 'Q1' },
                        { x: 173, y: 160, rev: 'MWK 1.8M', label: analyticsTimeframe === '30d' ? 'Wk 2' : analyticsTimeframe === '90d' ? 'Month 2' : 'Q2' },
                        { x: 286, y: 120, rev: 'MWK 2.4M', label: analyticsTimeframe === '30d' ? 'Wk 3' : analyticsTimeframe === '90d' ? 'Month 3' : 'Q3' },
                        { x: 400, y: 95, rev: 'MWK 3.1M', label: analyticsTimeframe === '30d' ? 'Wk 4' : analyticsTimeframe === '90d' ? 'Month 4' : 'Q4' },
                        { x: 513, y: 75, rev: 'MWK 3.7M', label: analyticsTimeframe === '30d' ? 'Wk 5' : analyticsTimeframe === '90d' ? 'Month 5' : 'Q5' },
                        { x: 626, y: 55, rev: 'MWK 4.1M', label: analyticsTimeframe === '30d' ? 'Wk 6' : analyticsTimeframe === '90d' ? 'Month 6' : 'Q6' },
                        { x: 740, y: 35, rev: 'MWK 4.5M', label: analyticsTimeframe === '30d' ? 'Wk 7' : analyticsTimeframe === '90d' ? 'Current' : 'Q7' },
                      ].map((pt, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={pt.x} cy={pt.y} r="6" fill="#5300b7" stroke="#ffffff" strokeWidth="2" />
                          <circle cx={pt.x} cy={pt.y} r="10" fill="#5300b7" opacity="0.2" className="group-hover:scale-125 transition-transform" />
                          <text x={pt.x} y="215" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="bold">
                            {pt.label}
                          </text>
                          <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#5300b7" fontSize="10" fontWeight="bold">
                            {pt.rev}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* What Users Are Viewing vs. Buying Breakdown */}
                <div className="pt-2 border-t border-[#ccc3d7]/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="font-serif-source text-lg font-bold text-[#1d1a24] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#5300b7]">insights</span>
                        Consumer Behavior: High View Interest vs. Actual Purchases
                      </h4>
                      <p className="text-xs text-[#4a4455]">
                        Comparing items that receive massive browsing volume with products converting into finalized sales
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Item 1 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            TEXTILES &amp; FASHION
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">Chitenje African Wax Fabrics</h5>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          13.1% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 24,500</span>
                            <span className="text-[#5300b7] font-bold">Buys: 640 Orders (MWK 1.28M)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#10b981] h-full" style={{ width: '80%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '20%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        🔥 High Demand &amp; High Purchase Rate: Top volume driver in soft goods and traditional apparel.
                      </p>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            ELECTRONICS
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">Samsung Galaxy S22 Ultra</h5>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          1.5% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 31,200 (Highest Views)</span>
                            <span className="text-[#5300b7] font-bold">Buys: 48 Orders (MWK 1.44M)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#3b82f6] h-full" style={{ width: '92%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '8%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        👀 High Browsing Curiosity: Users view heavily for price comparisons before buying.
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            GROCERIES &amp; FOOD
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">Fresh Lake Chambo Fish (5kg Pack)</h5>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          27.5% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 18,900</span>
                            <span className="text-[#5300b7] font-bold">Buys: 520 Orders (MWK 780k)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#10b981] h-full" style={{ width: '70%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '30%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        ⚡ Fastest Conversion: Essential fresh local product with immediate order completion.
                      </p>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-[#fef7ff] p-4 rounded-2xl border border-[#ccc3d7]/40 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#5300b7] bg-[#f3ebf9] px-2 py-0.5 rounded-md uppercase">
                            SOLAR &amp; ENERGY
                          </span>
                          <h5 className="font-bold text-sm text-[#1d1a24] mt-1">5kVA Solar Power Inverter Set</h5>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                          4.2% Conv.
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[#4a4455] font-semibold mb-1">
                            <span>Views: 14,800</span>
                            <span className="text-[#5300b7] font-bold">Buys: 62 Orders (MWK 930k)</span>
                          </div>
                          <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-[#8b5cf6] h-full" style={{ width: '85%' }} title="Views" />
                            <div className="bg-[#5300b7] h-full" style={{ width: '15%' }} title="Purchases" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#4a4455] italic bg-white p-2 rounded-xl border border-[#ccc3d7]/30">
                        🔋 High Ticket Solution: High order values drive strong overall merchant volume.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== APPROVALS TAB ==================== */}
          {activeNav === 'approvals' && (
            <div className="space-y-6">
              {/* Quality Control Header Banner */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#5300b7] uppercase tracking-widest block mb-1">
                    QUALITY CONTROL
                  </span>
                  <h1 className="font-serif-source text-3xl font-bold text-[#1d1a24]">
                    Product Approvals
                  </h1>
                  <p className="text-xs text-[#4a4455] max-w-xl mt-1 leading-relaxed">
                    Maintain marketplace integrity by reviewing incoming inventory. Ensure pricing strategy aligns with affiliate incentives and platform margins.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#f3ebf9] px-4 py-3 rounded-2xl border border-[#ccc3d7]/30 text-center min-w-[120px]">
                    <span className="text-[9px] font-bold text-[#7b7486] uppercase block">PENDING REVIEW</span>
                    <span className="font-serif-source text-xl font-bold text-[#5300b7]">{filteredApprovals.length} Items</span>
                  </div>
                  <div className="bg-[#f3ebf9] px-4 py-3 rounded-2xl border border-[#ccc3d7]/30 text-center min-w-[120px]">
                    <span className="text-[9px] font-bold text-[#7b7486] uppercase block">AVG. TAT</span>
                    <span className="font-serif-source text-xl font-bold text-[#1d1a24]">4.2 Hrs</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-3 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[260px] flex items-center bg-[#fef7ff] rounded-xl px-3 py-2 border border-[#ccc3d7]/50">
                  <span className="material-symbols-outlined text-[#4a4455] text-[20px] shrink-0">search</span>
                  <input
                    type="text"
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                    placeholder="Search by product name or seller..."
                    className="bg-transparent border-none focus:outline-none text-xs w-full px-2 text-[#1d1a24] placeholder-[#4a4455]/60"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={approvalCategory}
                    onChange={(e) => setApprovalCategory(e.target.value)}
                    className="bg-white border border-[#ccc3d7] text-xs font-bold text-[#4a4455] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">CATEGORY: ALL</option>
                    <option value="Fashion">Fashion &amp; Acc.</option>
                    <option value="Tech">Tech &amp; Gaming</option>
                    <option value="Home">Home Decor</option>
                  </select>

                  <select
                    value={approvalSort}
                    onChange={(e) => setApprovalSort(e.target.value as any)}
                    className="bg-white border border-[#ccc3d7] text-xs font-bold text-[#4a4455] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="oldest">OLDEST FIRST</option>
                    <option value="newest">NEWEST FIRST</option>
                  </select>
                </div>
              </div>

              {/* Product Approval Cards Grid */}
              {filteredApprovals.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-[#7b7486] border border-[#ccc3d7]/40 shadow-xs">
                  <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">verified</span>
                  <h3 className="font-serif-source text-xl font-bold text-[#1d1a24]">Queue Cleared!</h3>
                  <p className="text-xs mt-1">No products currently match your review filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredApprovals.map((appr) => {
                    const mk = getMarkup(appr.id);
                    const cm = getComm(appr.id);

                    const platEarnings = appr.sellerPrice * (mk / 100);
                    const affilEarnings = appr.sellerPrice * (cm / 100);
                    const mktPrice = appr.sellerPrice + platEarnings + affilEarnings;
                    const markupPctDisplay = (((mktPrice - appr.sellerPrice) / appr.sellerPrice) * 100).toFixed(1);

                    return (
                      <div
                        key={appr.id}
                        className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Left Images Preview */}
                          <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-[#f3ebf9] shrink-0 relative flex flex-col gap-1">
                            <img
                              src={appr.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                              alt={appr.productName}
                              className="w-full h-full object-cover"
                            />
                            {appr.images.length > 1 && (
                              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                                +{appr.images.length - 1} More
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-[#5300b7] uppercase px-2 py-0.5 bg-[#ebddff] rounded-md">
                                {appr.category}
                              </span>
                              <span className="text-[#7b7486]">
                                Stock: {appr.stock} Units • {appr.submittedTime}
                              </span>
                            </div>

                            <h3 className="font-serif-source text-lg font-bold text-[#1d1a24] leading-snug">
                              {appr.productName}
                            </h3>

                            <p className="text-xs text-[#4a4455] line-clamp-2 leading-relaxed">
                              {appr.description}
                            </p>

                            {/* Prices */}
                            <div className="pt-1 flex items-baseline gap-4">
                              <div>
                                <span className="text-[9px] font-bold text-[#7b7486] uppercase block">
                                  SELLER PRICE
                                </span>
                                <span className="font-serif-source text-base font-bold text-[#1d1a24]">
                                  ${appr.sellerPrice.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-[#5300b7] uppercase block">
                                  MARKETPLACE PRICE
                                </span>
                                <span className="font-serif-source text-base font-bold text-[#5300b7]">
                                  ${mktPrice.toFixed(2)}{' '}
                                  <span className="text-[10px] font-semibold text-emerald-600">
                                    +{markupPctDisplay}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Matrix Breakdown */}
                        <div className="bg-[#fef7ff] p-3 rounded-2xl border border-[#ccc3d7]/30 grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-[#7b7486] uppercase block font-semibold">PLAT. EARNS</span>
                            <span className="font-bold text-[#5300b7]">${platEarnings.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#7b7486] uppercase block font-semibold">AFFIL. EARNS</span>
                            <span className="font-bold text-[#5300b7]">${affilEarnings.toFixed(2)}</span>
                          </div>
                          <div className="bg-[#ebddff]/50 rounded-xl py-1">
                            <span className="text-[9px] text-[#5300b7] uppercase block font-semibold">SELLER RECEIVES</span>
                            <span className="font-bold text-[#5300b7]">${appr.sellerPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Interactive Percentage Adjustments */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                              PLAT. MARKUP %
                            </label>
                            <input
                              type="number"
                              value={mk}
                              onChange={(e) =>
                                updateMarkup(appr.id, parseFloat(e.target.value) || 0, cm)
                              }
                              className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                              AFFIL. COMM %
                            </label>
                            <input
                              type="number"
                              value={cm}
                              onChange={(e) =>
                                updateMarkup(appr.id, mk, parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                            />
                          </div>
                        </div>

                        {/* Verification & Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#ccc3d7]/30">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#5300b7] text-[18px]">badge</span>
                            <div>
                              <p className="text-xs font-bold text-[#1d1a24]">{appr.sellerName}</p>
                              <span className="text-[9px] font-extrabold text-[#5300b7] uppercase tracking-wider block">
                                VERIFIED SELLER
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                onRejectProduct(appr.id);
                                onShowToast(`Rejected product "${appr.productName}"`);
                              }}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[#ba1a1a] font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              REJECT
                            </button>
                            <button
                              onClick={() => {
                                onApproveProduct(appr.id);
                                onShowToast(`Approved "${appr.productName}" for Live Marketplace!`);
                              }}
                              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                            >
                              APPROVE &amp; GO LIVE
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              <div className="text-center pt-4">
                <button
                  onClick={() => onShowToast('Loaded older approval queue!')}
                  className="px-6 py-3 rounded-xl border border-[#ccc3d7] bg-white text-[#1d1a24] font-bold text-xs hover:bg-[#f3ebf9] transition-colors shadow-xs cursor-pointer"
                >
                  LOAD MORE PENDING PRODUCTS
                </button>
              </div>
            </div>
          )}

          {/* ==================== SELLERS TAB ==================== */}
          {activeNav === 'sellers' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#5300b7] uppercase tracking-widest block mb-1">
                    MERCHANT NETWORK
                  </span>
                  <h1 className="font-serif-source text-3xl font-bold text-[#1d1a24]">
                    Sellers Management
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full border-2 border-white"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt="User"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full border-2 border-white"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                      alt="User"
                    />
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#f3ebf9] text-[#5300b7] font-bold text-[10px] border-2 border-white">
                      +12
                    </div>
                  </div>

                  <button
                    onClick={() => onShowToast('Invite link generated for new merchant onboarding!')}
                    className="flex items-center gap-2 bg-[#5300b7] hover:bg-[#6d28d9] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>INVITE SELLER</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sellers */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">storefront</span>
                    </div>
                    <span className="text-xs font-bold text-[#4a4455]">+4% this month</span>
                  </div>
                  <div>
                    <span className="font-serif-source text-3xl font-bold text-[#1d1a24]">430</span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL SELLERS
                    </span>
                  </div>
                </div>

                {/* Approved Active */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-serif-source text-3xl font-bold text-[#1d1a24]">418</span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      APPROVED ACTIVE
                    </span>
                  </div>
                </div>

                {/* Pending Review */}
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                    </div>
                    <span className="bg-[#ba1a1a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      URGENT
                    </span>
                  </div>
                  <div>
                    <span className="font-serif-source text-3xl font-bold text-[#ba1a1a]">12</span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      PENDING REVIEW
                    </span>
                  </div>
                </div>

                {/* Settlement Pool */}
                <div className="bg-[#5300b7] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-white/20 text-white rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <span className="text-[10px] text-[#dac5ff]">Settlement Pool</span>
                  </div>
                  <div>
                    <span className="font-serif-source text-2xl font-bold text-white block">MWK 2.4M</span>
                    <span className="text-[10px] font-bold text-[#dac5ff] uppercase tracking-wider block">
                      SELLER BALANCES
                    </span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="bg-[#f3ebf9] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[280px] flex items-center bg-white rounded-xl px-3 py-2 border border-[#ccc3d7]/50">
                  <span className="material-symbols-outlined text-[#4a4455] text-[20px] shrink-0">search</span>
                  <input
                    type="text"
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    placeholder="Search by name, shop, or ID..."
                    className="bg-transparent border-none focus:outline-none text-xs w-full px-2 text-[#1d1a24] placeholder-[#4a4455]/60"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sellerStatusFilter}
                    onChange={(e) => setSellerStatusFilter(e.target.value as any)}
                    className="bg-white border border-[#ccc3d7] text-xs font-bold text-[#4a4455] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">STATUS: ALL</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>

                  <button
                    onClick={() => onShowToast('Exported Seller Roster CSV')}
                    className="p-2 bg-white border border-[#ccc3d7] rounded-xl text-[#4a4455] hover:text-[#5300b7]"
                    title="Download"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>

                  <span className="text-xs font-bold text-[#4a4455] hidden sm:inline">Show: 25 Rows</span>
                </div>
              </div>

              {/* Sellers Management Table */}
              <div className="bg-white rounded-3xl shadow-xs overflow-hidden border border-[#ccc3d7]/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f3ebf9]/60 border-b border-[#ccc3d7]/40 text-[#4a4455] font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">MERCHANT / EMAIL</th>
                        <th className="p-4">BUSINESS</th>
                        <th className="p-4">LOCATION</th>
                        <th className="p-4">NATIONAL ID</th>
                        <th className="p-4 text-right">BALANCE</th>
                        <th className="p-4 text-center">STATUS</th>
                        <th className="p-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc3d7]/30">
                      {filteredSellers.map((s) => (
                        <tr key={s.id} className="hover:bg-[#fef7ff] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#f3ebf9] flex items-center justify-center text-[#5300b7] font-bold text-xs shrink-0">
                                {s.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[#1d1a24] block truncate">{s.fullName}</span>
                                <span className="text-[10px] text-[#7b7486] truncate block">{s.storeName.toLowerCase().replace(/\s+/g, '')}@pamsika.mw</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-[#1d1a24] block">{s.storeName}</span>
                            <span className="text-[10px] text-[#7b7486]">{s.category}</span>
                          </td>
                          <td className="p-4 text-[#4a4455]">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-[#5300b7]">location_on</span>
                              <span>{s.location}</span>
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[#7b7486]">{s.nationalId}</td>
                          <td className="p-4 text-right font-serif-source font-bold text-base text-[#1d1a24]">
                            MWK {s.balance.toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                s.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : s.status === 'Pending'
                                  ? 'bg-[#ebddff] text-[#5300b7]'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {s.status === 'Active' ? (
                              <button
                                onClick={() => {
                                  onToggleSellerStatus(s.id, 'Suspended');
                                  onShowToast(`Suspended seller "${s.storeName}"`);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 text-[10px] font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                SUSPEND
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  onToggleSellerStatus(s.id, 'Active');
                                  onShowToast(`Approved seller "${s.storeName}"`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#5300b7] text-white text-[10px] font-bold hover:bg-[#6d28d9] transition-colors shadow-xs cursor-pointer"
                              >
                                APPROVE
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Pagination */}
                <div className="p-4 bg-[#f3ebf9]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7b7486]">
                  <span>Showing 1 to {filteredSellers.length} of {sellers.length} sellers</span>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1 bg-white border border-[#ccc3d7] rounded-lg hover:bg-gray-50">Prev</button>
                    <button className="px-3 py-1 bg-[#5300b7] text-white font-bold rounded-lg">1</button>
                    <button className="px-3 py-1 bg-white border border-[#ccc3d7] rounded-lg hover:bg-gray-50">2</button>
                    <button className="px-3 py-1 bg-white border border-[#ccc3d7] rounded-lg hover:bg-gray-50">Next</button>
                  </div>
                </div>
              </div>

              {/* Map & Insight Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative h-60 rounded-3xl overflow-hidden shadow-sm bg-[#5300b7] text-white p-6 flex flex-col justify-between">
                  <div className="relative z-10 max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#dac5ff] block mb-1">
                      GEOGRAPHIC INTELLIGENCE
                    </span>
                    <h3 className="font-serif-source text-2xl font-bold">Regional Distribution</h3>
                    <p className="text-xs text-[#dac5ff] mt-2 leading-relaxed">
                      Our merchant network is concentrated in Blantyre (42%) and Lilongwe (35%), with emerging growth in the Northern Region.
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-white">3 Active Registrations in Mzuzu</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#5300b7] uppercase tracking-widest block mb-1">
                      QUICK INSIGHT
                    </span>
                    <h4 className="font-serif-source text-lg font-bold text-[#1d1a24]">
                      Verification Speed
                    </h4>
                    <p className="text-xs text-[#4a4455] mt-2 leading-relaxed">
                      Average seller approval time has dropped by <span className="text-emerald-600 font-bold">18%</span> since the new automated document verification pipeline was enabled.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="text-[#4a4455]">Verification Accuracy</span>
                      <span className="text-[#5300b7]">99.2%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f3ebf9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5300b7] rounded-full w-[99.2%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ORDERS TAB ==================== */}
          {activeNav === 'orders' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">System Orders Ledger</h3>
                <button
                  onClick={() => onShowToast('Admin: Order Ledger exported!')}
                  className="bg-[#5300b7] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#6d28d9]"
                >
                  Download Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f3ebf9] text-[#4a4455] border-b border-[#ccc3d7]/30 text-[10px] font-bold uppercase">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Summary</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ccc3d7]/20">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#fef7ff]">
                        <td className="p-3 font-bold text-[#5300b7]">{ord.id}</td>
                        <td className="p-3 font-medium text-[#1d1a24]">
                          {ord.customerName}
                          <span className="block text-[10px] text-[#7b7486]">{ord.customerEmail}</span>
                        </td>
                        <td className="p-3 text-[#4a4455]">{ord.itemsSummary}</td>
                        <td className="p-3 font-serif-source font-bold text-sm text-[#1d1a24]">
                          MWK {ord.amount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-[#ebddff] text-[#5300b7] font-bold rounded-full uppercase text-[9px]">
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              onToggleOrderDone(ord.id);
                              onShowToast(`Updated status for ${ord.id}`);
                            }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Delivered
                          </button>
                          <button
                            onClick={() => {
                              onCancelOrder(ord.id);
                              onShowToast(`Cancelled ${ord.id}`);
                            }}
                            className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PRODUCTS TAB ==================== */}
          {activeNav === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner & Upload Product Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#ccc3d7]/40 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#5300b7] bg-[#ebddff] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      LIVE CATALOG &bull; {products.length} PRODUCTS
                    </span>
                  </div>
                  <h1 className="font-serif-source text-2xl sm:text-3xl font-bold text-[#1d1a24]">
                    Products Management
                  </h1>
                  <p className="text-xs text-[#4a4455] mt-1">
                    Manage published catalog inventory, edit product details, adjust pricing/stock, or delete listings.
                  </p>
                </div>

                {/* PLUS BUTTON TO UPLOAD NEW PRODUCTS */}
                <button
                  onClick={openAddProductModal}
                  className="flex items-center justify-center gap-2 bg-[#5300b7] hover:bg-[#6d28d9] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span className="uppercase tracking-wider">UPLOAD NEW PRODUCT</span>
                </button>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="p-2 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                      ACTIVE
                    </span>
                  </div>
                  <div>
                    <span className="font-serif-source text-2xl sm:text-3xl font-bold text-[#1d1a24]">
                      {products.length}
                    </span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      TOTAL PRODUCTS
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      READY TO SHIP
                    </span>
                  </div>
                  <div>
                    <span className="font-serif-source text-2xl sm:text-3xl font-bold text-emerald-600">
                      {inStockCount}
                    </span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      IN STOCK ITEMS
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                    </span>
                    {lowStockCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                        ATTENTION
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-serif-source text-2xl sm:text-3xl font-bold text-amber-700">
                      {lowStockCount}
                    </span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      LOW / OUT OF STOCK
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#ccc3d7]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="p-2 bg-[#f3ebf9] text-[#5300b7] rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#5300b7] bg-[#ebddff] px-2 py-0.5 rounded-full uppercase">
                      MWK EST
                    </span>
                  </div>
                  <div>
                    <span className="font-serif-source text-xl sm:text-2xl font-bold text-[#1d1a24]">
                      MWK {totalCatalogValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-[#4a4455] uppercase tracking-wider block">
                      CATALOG INVENTORY VALUE
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls Bar: Search, Category Filter, Sort, View Toggle */}
              <div className="bg-white p-4 rounded-3xl border border-[#ccc3d7]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
                {/* Search Input */}
                <div className="flex-1 min-w-[260px] flex items-center bg-[#fef7ff] rounded-2xl px-3.5 py-2 border border-[#ccc3d7]/60">
                  <span className="material-symbols-outlined text-[#4a4455] text-[20px] shrink-0">search</span>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product name, seller, description..."
                    className="bg-transparent border-none focus:outline-none text-xs w-full px-2 text-[#1d1a24] placeholder-[#4a4455]/60"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="text-[#4a4455] hover:text-[#1d1a24] p-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                {/* Filters and View Switcher */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Select */}
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-[#fef7ff] border border-[#ccc3d7] text-xs font-bold text-[#1d1a24] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    {allCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        CATEGORY: {cat.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {/* Sort Select */}
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value as any)}
                    className="bg-[#fef7ff] border border-[#ccc3d7] text-xs font-bold text-[#1d1a24] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="newest">SORT: NEWEST</option>
                    <option value="price-low">PRICE: LOW TO HIGH</option>
                    <option value="price-high">PRICE: HIGH TO LOW</option>
                    <option value="stock-low">LOWEST STOCK</option>
                  </select>

                  {/* Grid vs Table View Mode */}
                  <div className="flex items-center bg-[#f3ebf9] p-1 rounded-xl">
                    <button
                      onClick={() => setProductViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        productViewMode === 'grid' ? 'bg-[#5300b7] text-white shadow-xs' : 'text-[#4a4455]'
                      }`}
                      title="Grid View"
                    >
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                    <button
                      onClick={() => setProductViewMode('table')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        productViewMode === 'table' ? 'bg-[#5300b7] text-white shadow-xs' : 'text-[#4a4455]'
                      }`}
                      title="Table View"
                    >
                      <span className="material-symbols-outlined text-[18px]">view_list</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Listing Display (Grid or Table) */}
              {filteredProductsList.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#ccc3d7]/40 shadow-xs space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#5300b7]">inventory</span>
                  <p className="font-bold text-base text-[#1d1a24]">No Products Found</p>
                  <p className="text-xs text-[#7b7486] max-w-md mx-auto">
                    No items match your search term or category filter. Try clearing filters or upload a new product.
                  </p>
                  <button
                    onClick={() => {
                      setProductSearch('');
                      setProductCategoryFilter('ALL');
                    }}
                    className="px-4 py-2 bg-[#f3ebf9] text-[#5300b7] rounded-xl text-xs font-bold hover:bg-[#ebddff] cursor-pointer"
                  >
                    Reset Search &amp; Filters
                  </button>
                </div>
              ) : productViewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProductsList.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div className="relative aspect-4/3 bg-[#f8f5fa] overflow-hidden">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                            <span className="bg-[#5300b7] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs">
                              {prod.category}
                            </span>
                            {prod.badge && (
                              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs">
                                {prod.badge}
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            <span>{prod.viewsCount || 0}</span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-sm text-[#1d1a24] line-clamp-1 group-hover:text-[#5300b7] transition-colors">
                            {prod.name}
                          </h4>

                          <div className="flex items-center justify-between">
                            <span className="font-serif-source font-bold text-lg text-[#5300b7]">
                              MWK {prod.price.toLocaleString()}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                (prod.stock ?? 1) > 5
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : (prod.stock ?? 1) > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {(prod.stock ?? 1) > 0 ? `Stock: ${prod.stock ?? 1}` : 'Out of Stock'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#4a4455] pt-1 border-t border-[#ccc3d7]/20">
                            <span className="material-symbols-outlined text-[16px] text-[#5300b7]">store</span>
                            <span className="truncate font-semibold">{prod.sellerName || 'Verified Seller'}</span>
                            {prod.sellerVerified && (
                              <span className="material-symbols-outlined text-[14px] text-[#5300b7]">check_circle</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons: Edit & Delete */}
                      <div className="p-3 bg-[#fef7ff] border-t border-[#ccc3d7]/30 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="flex-1 py-2 px-3 bg-white border border-[#ccc3d7] text-[#5300b7] hover:bg-[#f3ebf9] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>EDIT</span>
                        </button>

                        <button
                          onClick={() => setDeletingProduct(prod)}
                          className="py-2 px-3 bg-rose-50 border border-rose-200 text-[#ba1a1a] hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Delete Product"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span className="hidden sm:inline">DELETE</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f3ebf9]/70 border-b border-[#ccc3d7]/40 text-[#4a4455] font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4">PRODUCT</th>
                          <th className="p-4">CATEGORY</th>
                          <th className="p-4">PRICE</th>
                          <th className="p-4">STOCK</th>
                          <th className="p-4">SELLER / MERCHANT</th>
                          <th className="p-4 text-center">BADGE</th>
                          <th className="p-4 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ccc3d7]/30">
                        {filteredProductsList.map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#fef7ff] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-[#ccc3d7]/40 shrink-0 bg-[#f3ebf9]"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-[#1d1a24] block truncate">{prod.name}</span>
                                  <span className="text-[10px] text-[#7b7486] truncate block">ID: {prod.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-[#ebddff] text-[#5300b7] px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-4 font-serif-source font-bold text-sm text-[#5300b7]">
                              MWK {prod.price.toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span
                                className={`font-bold text-xs ${
                                  (prod.stock ?? 1) > 0 ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {prod.stock ?? 0} units
                              </span>
                            </td>
                            <td className="p-4 font-medium text-[#1d1a24]">
                              {prod.sellerName || 'Verified Merchant'}
                            </td>
                            <td className="p-4 text-center">
                              {prod.badge ? (
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase">
                                  {prod.badge}
                                </span>
                              ) : (
                                <span className="text-[#7b7486] text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditProductModal(prod)}
                                  className="p-1.5 bg-white border border-[#ccc3d7] text-[#5300b7] hover:bg-[#f3ebf9] rounded-xl font-bold transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(prod)}
                                  className="p-1.5 bg-rose-50 border border-rose-200 text-[#ba1a1a] hover:bg-rose-100 rounded-xl font-bold transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== AFFILIATES TAB ==================== */}
          {activeNav === 'affiliates' && (() => {
            // Filtered lists
            const filteredAffiliates = affiliatesList.filter((aff) => {
              const matchesSearch =
                aff.name.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                aff.phone.includes(affiliateSearch) ||
                aff.email.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                aff.doloCode.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                aff.id.toLowerCase().includes(affiliateSearch.toLowerCase());
              const matchesTier =
                affiliateTierFilter === 'ALL' || aff.tier === affiliateTierFilter;
              return matchesSearch && matchesTier;
            });

            const filteredCommissionPaid = commissionPaidList.filter((p) => {
              return (
                p.affiliateName.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                p.phone.includes(affiliateSearch) ||
                p.transactionRef.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                p.id.toLowerCase().includes(affiliateSearch.toLowerCase())
              );
            });

            const filteredWithdrawals = affiliateWithdrawalsList.filter((w) => {
              return (
                w.affiliateName.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                w.phone.includes(affiliateSearch) ||
                w.id.toLowerCase().includes(affiliateSearch.toLowerCase())
              );
            });

            const filteredClickLogs = clickLogsList.filter((c) => {
              return (
                c.affiliateName.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                c.doloCode.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
                c.productName.toLowerCase().includes(affiliateSearch.toLowerCase())
              );
            });

            // Summary Totals
            const totalAffiliatesCount = affiliatesList.length;
            const totalSalesGenSum = affiliatesList.reduce((acc, curr) => acc + curr.totalSalesGenerated, 0);
            const totalCommEarnedSum = affiliatesList.reduce((acc, curr) => acc + curr.totalCommissionEarned, 0);
            const totalWithdrawnSum = affiliatesList.reduce((acc, curr) => acc + curr.totalWithdrawn, 0);
            const totalCurrentBalSum = affiliatesList.reduce((acc, curr) => acc + curr.currentBalance, 0);

            const totalCommPaidSum = commissionPaidList.reduce((acc, curr) => acc + curr.amountPaid, 0);
            const totalPendingWthSum = affiliateWithdrawalsList
              .filter((w) => w.status === 'Pending Approval')
              .reduce((acc, curr) => acc + curr.requestedAmount, 0);

            return (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#5300b7] via-[#6d28d9] to-[#3b0082] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      Dolo Affiliate Network Control Panel
                    </div>
                    <h2 className="font-serif-source text-2xl sm:text-3xl font-bold tracking-tight">
                      Affiliates, Commissions &amp; Earnings Log
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-100 max-w-2xl mt-1">
                      Monitor ambassador performance, track sales conversions, audit commission disbursements, and export full reports to Excel.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => setAffiliateSubTab('total-affiliates')}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        affiliateSubTab === 'total-affiliates'
                          ? 'bg-white text-[#5300b7] shadow-lg scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">people</span>
                      All Affiliates ({totalAffiliatesCount})
                    </button>
                    <button
                      onClick={() => setAffiliateSubTab('commission-paid')}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        affiliateSubTab === 'commission-paid'
                          ? 'bg-white text-[#5300b7] shadow-lg scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      Commissions Paid
                    </button>
                    <button
                      onClick={() => setAffiliateSubTab('pending-withdrawals')}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        affiliateSubTab === 'pending-withdrawals'
                          ? 'bg-white text-[#5300b7] shadow-lg scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                      Withdrawal Requests
                    </button>
                  </div>
                </div>

                {/* Sub-Tab KPI Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setAffiliateSubTab('total-affiliates')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      affiliateSubTab === 'total-affiliates'
                        ? 'bg-[#f3ebf9] border-[#5300b7] ring-2 ring-[#5300b7]/20'
                        : 'bg-white border-[#ccc3d7]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#7b7486] mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">TOTAL AFFILIATES</span>
                      <span className="material-symbols-outlined text-[20px] text-[#5300b7]">badge</span>
                    </div>
                    <p className="font-serif-source text-2xl font-bold text-[#1d1a24]">
                      {totalAffiliatesCount} Promoters
                    </p>
                    <span className="text-[11px] text-[#5300b7] font-semibold mt-1 block">
                      Generated MWK {(totalSalesGenSum / 1000000).toFixed(1)}M sales
                    </span>
                  </button>

                  <button
                    onClick={() => setAffiliateSubTab('commission-paid')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      affiliateSubTab === 'commission-paid'
                        ? 'bg-[#f3ebf9] border-[#5300b7] ring-2 ring-[#5300b7]/20'
                        : 'bg-white border-[#ccc3d7]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#7b7486] mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">COMMISSION PAID</span>
                      <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
                    </div>
                    <p className="font-serif-source text-2xl font-bold text-emerald-700">
                      MWK {totalCommPaidSum.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                      {commissionPaidList.length} Disbursed Batches
                    </span>
                  </button>

                  <button
                    onClick={() => setAffiliateSubTab('pending-withdrawals')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      affiliateSubTab === 'pending-withdrawals'
                        ? 'bg-[#f3ebf9] border-[#5300b7] ring-2 ring-[#5300b7]/20'
                        : 'bg-white border-[#ccc3d7]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#7b7486] mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">PENDING WITHDRAWALS</span>
                      <span className="material-symbols-outlined text-[20px] text-amber-600">pending_actions</span>
                    </div>
                    <p className="font-serif-source text-2xl font-bold text-amber-700">
                      MWK {totalPendingWthSum.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                      {affiliateWithdrawalsList.filter((w) => w.status === 'Pending Approval').length} Requests Waiting
                    </span>
                  </button>

                  <button
                    onClick={() => setAffiliateSubTab('total-affiliates')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      affiliateSubTab === 'total-affiliates'
                        ? 'bg-[#f3ebf9] border-[#5300b7] ring-2 ring-[#5300b7]/20'
                        : 'bg-white border-[#ccc3d7]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#7b7486] mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">UNPAID BALANCES</span>
                      <span className="material-symbols-outlined text-[20px] text-[#5300b7]">account_balance</span>
                    </div>
                    <p className="font-serif-source text-2xl font-bold text-[#5300b7]">
                      MWK {totalCurrentBalSum.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-[#5300b7] font-semibold mt-1 block">
                      Held in Affiliate Wallets
                    </span>
                  </button>
                </div>

                {/* Filter and Download Action Bar */}
                <div className="bg-white rounded-3xl p-5 border border-[#ccc3d7]/40 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7486] text-[20px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={affiliateSearch}
                      onChange={(e) => setAffiliateSearch(e.target.value)}
                      placeholder={
                        affiliateSubTab === 'total-affiliates'
                          ? 'Search by affiliate name, phone, email, or DOLO code...'
                          : affiliateSubTab === 'commission-paid'
                          ? 'Search by recipient name, phone, or transaction ref...'
                          : affiliateSubTab === 'pending-withdrawals'
                          ? 'Search pending withdrawal requests...'
                          : 'Search link click logs...'
                      }
                      className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                    />
                  </div>

                  {/* Filter select for affiliates */}
                  {affiliateSubTab === 'total-affiliates' && (
                    <select
                      value={affiliateTierFilter}
                      onChange={(e) => setAffiliateTierFilter(e.target.value)}
                      className="bg-[#fef7ff] border border-[#ccc3d7] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Tiers</option>
                      <option value="VIP Influencer">VIP Influencer</option>
                      <option value="Tier 1 Ambassador">Tier 1 Ambassador</option>
                      <option value="Tier 2 Promoter">Tier 2 Promoter</option>
                    </select>
                  )}

                  {/* Excel Download Button */}
                  <button
                    onClick={() => {
                      if (affiliateSubTab === 'total-affiliates') {
                        const headers = [
                          'Affiliate ID',
                          'Name',
                          'Phone',
                          'Email',
                          'Location',
                          'DOLO Code',
                          'Tier',
                          'Sub-Invites',
                          'Total Sales Generated (MWK)',
                          'Total Commission Earned (MWK)',
                          'Total Withdrawn (MWK)',
                          'Current Balance (MWK)',
                          'Payout Account',
                          'Joined Date',
                          'Status'
                        ];
                        const rows = filteredAffiliates.map((a) => [
                          a.id,
                          a.name,
                          a.phone,
                          a.email,
                          a.location,
                          a.doloCode,
                          a.tier,
                          a.subInvites,
                          a.totalSalesGenerated,
                          a.totalCommissionEarned,
                          a.totalWithdrawn,
                          a.currentBalance,
                          a.payoutAccount,
                          a.joinedDate,
                          a.status
                        ]);
                        handleExportToExcel('All_Dolo_Affiliates_Report', headers, rows);
                      } else if (affiliateSubTab === 'commission-paid') {
                        const headers = [
                          'Payment Ref',
                          'Date Paid',
                          'Affiliate ID',
                          'Affiliate Name',
                          'Phone',
                          'Payout Channel',
                          'Account Details',
                          'Amount Paid (MWK)',
                          'Transaction Ref',
                          'Sales Period',
                          'Disbursed By',
                          'Status'
                        ];
                        const rows = filteredCommissionPaid.map((p) => [
                          p.id,
                          p.date,
                          p.affiliateId,
                          p.affiliateName,
                          p.phone,
                          p.payoutChannel,
                          p.accountDetails,
                          p.amountPaid,
                          p.transactionRef,
                          p.salesPeriod,
                          p.disbursedBy,
                          p.status
                        ]);
                        handleExportToExcel('Commissions_Paid_History_Report', headers, rows);
                      } else if (affiliateSubTab === 'pending-withdrawals') {
                        const headers = [
                          'Request Ref',
                          'Request Date',
                          'Affiliate ID',
                          'Affiliate Name',
                          'Phone',
                          'Payout Method',
                          'Account Number',
                          'Available Balance (MWK)',
                          'Requested Amount (MWK)',
                          'Status'
                        ];
                        const rows = filteredWithdrawals.map((w) => [
                          w.id,
                          w.requestDate,
                          w.affiliateId,
                          w.affiliateName,
                          w.phone,
                          w.payoutMethod,
                          w.accountNumber,
                          w.availableBalance,
                          w.requestedAmount,
                          w.status
                        ]);
                        handleExportToExcel('Affiliate_Withdrawal_Requests_Report', headers, rows);
                      } else {
                        const headers = [
                          'Log Ref',
                          'Date Time',
                          'Affiliate Name',
                          'DOLO Code',
                          'Target Item',
                          'Traffic Source',
                          'Converted',
                          'Commission Earned (MWK)'
                        ];
                        const rows = filteredClickLogs.map((c) => [
                          c.id,
                          c.date,
                          c.affiliateName,
                          c.doloCode,
                          c.productName,
                          c.trafficSource,
                          c.converted ? 'Yes' : 'No',
                          c.commissionEarned
                        ]);
                        handleExportToExcel('Affiliate_Traffic_Clicks_Report', headers, rows);
                      }
                    }}
                    className="bg-[#107c41] hover:bg-[#0b5c30] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download Excel (.CSV)</span>
                  </button>
                </div>

                {/* Sub-Tab 1: Total Affiliates Table */}
                {affiliateSubTab === 'total-affiliates' && (
                  <div className="bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs overflow-hidden">
                    <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">
                          Registered Affiliates &amp; Promoters Directory
                        </h3>
                        <p className="text-xs text-[#7b7486]">
                          Showing {filteredAffiliates.length} of {affiliatesList.length} active promoters
                        </p>
                      </div>
                      <span className="text-xs text-[#5300b7] font-bold bg-[#f3ebf9] px-3 py-1 rounded-full">
                        Total Sales Volume: MWK {totalSalesGenSum.toLocaleString()}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#fef7ff] border-b border-[#ccc3d7]/30 text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">
                            <th className="p-4">Affiliate / ID</th>
                            <th className="p-4">Contact Info</th>
                            <th className="p-4">Tier &amp; Joined</th>
                            <th className="p-4 text-center">Sub-Invites</th>
                            <th className="p-4 text-right">Sales Generated</th>
                            <th className="p-4 text-right">Total Earned</th>
                            <th className="p-4 text-right">Withdrawn</th>
                            <th className="p-4 text-right">Current Balance</th>
                            <th className="p-4 text-center">Payout Method</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc3d7]/20">
                          {filteredAffiliates.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="p-8 text-center text-[#7b7486]">
                                No affiliates match your search.
                              </td>
                            </tr>
                          ) : (
                            filteredAffiliates.map((aff) => (
                              <tr key={aff.id} className="hover:bg-[#fef7ff]/60 transition-colors">
                                <td className="p-4">
                                  <div className="font-bold text-[#1d1a24] text-xs">{aff.name}</div>
                                  <div className="text-[10px] font-mono text-[#5300b7] font-bold">
                                    {aff.id} • {aff.doloCode}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-medium text-[#1d1a24]">{aff.phone}</div>
                                  <div className="text-[10px] text-[#7b7486] truncate max-w-[140px]">{aff.email}</div>
                                </td>
                                <td className="p-4">
                                  <span className="inline-block px-2 py-0.5 bg-[#f3ebf9] text-[#5300b7] rounded-md font-bold text-[10px] mb-0.5">
                                    {aff.tier}
                                  </span>
                                  <div className="text-[10px] text-[#7b7486]">
                                    {aff.location} • {aff.joinedDate}
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="font-bold text-[#1d1a24] bg-gray-100 px-2 py-1 rounded-lg">
                                    {aff.subInvites}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-[#1d1a24]">
                                  MWK {aff.totalSalesGenerated.toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-emerald-700">
                                  MWK {aff.totalCommissionEarned.toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-serif-source font-medium text-gray-600">
                                  MWK {aff.totalWithdrawn.toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-[#5300b7]">
                                  MWK {aff.currentBalance.toLocaleString()}
                                </td>
                                <td className="p-4 text-center text-[10px] font-bold text-[#4a4455]">
                                  {aff.payoutAccount}
                                </td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                      aff.status === 'VIP'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {aff.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Commission Paid History */}
                {affiliateSubTab === 'commission-paid' && (
                  <div className="bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs overflow-hidden">
                    <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">
                          Commission Payouts &amp; Disbursement Audit Log
                        </h3>
                        <p className="text-xs text-[#7b7486]">
                          Showing {filteredCommissionPaid.length} completed payout disbursements
                        </p>
                      </div>
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-full">
                        Total Settled: MWK {totalCommPaidSum.toLocaleString()}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#fef7ff] border-b border-[#ccc3d7]/30 text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">
                            <th className="p-4">Payment Ref</th>
                            <th className="p-4">Date &amp; Time</th>
                            <th className="p-4">Recipient Affiliate</th>
                            <th className="p-4">Payout Method</th>
                            <th className="p-4 text-right">Amount Paid</th>
                            <th className="p-4">Transaction Ref</th>
                            <th className="p-4">Sales Batch / Notes</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc3d7]/20">
                          {filteredCommissionPaid.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-[#7b7486]">
                                No commission payment records match your query.
                              </td>
                            </tr>
                          ) : (
                            filteredCommissionPaid.map((p) => (
                              <tr key={p.id} className="hover:bg-[#fef7ff]/60 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#5300b7]">{p.id}</td>
                                <td className="p-4 text-[#4a4455] font-medium">{p.date}</td>
                                <td className="p-4">
                                  <div className="font-bold text-[#1d1a24]">{p.affiliateName}</div>
                                  <div className="text-[10px] text-[#7b7486]">{p.phone}</div>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-[#1d1a24]">{p.payoutChannel}</span>
                                  <div className="text-[10px] text-[#7b7486] font-mono">{p.accountDetails}</div>
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-emerald-700 text-sm">
                                  MWK {p.amountPaid.toLocaleString()}
                                </td>
                                <td className="p-4 font-mono text-[11px] font-bold text-gray-700">
                                  {p.transactionRef}
                                </td>
                                <td className="p-4 text-[#4a4455] max-w-[180px]">
                                  <div className="truncate font-medium">{p.salesPeriod}</div>
                                  <div className="text-[10px] text-[#7b7486]">by {p.disbursedBy}</div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Pending Withdrawal Requests */}
                {affiliateSubTab === 'pending-withdrawals' && (
                  <div className="bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs overflow-hidden">
                    <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">
                          Affiliate Payout &amp; Withdrawal Requests
                        </h3>
                        <p className="text-xs text-[#7b7486]">
                          Review wallet cashout requests and approve instant payouts
                        </p>
                      </div>
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full">
                        Pending Volume: MWK {totalPendingWthSum.toLocaleString()}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#fef7ff] border-b border-[#ccc3d7]/30 text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">
                            <th className="p-4">Request Ref</th>
                            <th className="p-4">Date Submitted</th>
                            <th className="p-4">Affiliate</th>
                            <th className="p-4 text-right">Wallet Balance</th>
                            <th className="p-4 text-right">Requested Payout</th>
                            <th className="p-4">Payout Account</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc3d7]/20">
                          {filteredWithdrawals.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-[#7b7486]">
                                No pending withdrawal requests found.
                              </td>
                            </tr>
                          ) : (
                            filteredWithdrawals.map((w) => (
                              <tr key={w.id} className="hover:bg-[#fef7ff]/60 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#5300b7]">{w.id}</td>
                                <td className="p-4 text-[#4a4455]">{w.requestDate}</td>
                                <td className="p-4">
                                  <div className="font-bold text-[#1d1a24]">{w.affiliateName}</div>
                                  <div className="text-[10px] text-[#7b7486]">{w.phone}</div>
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-[#5300b7]">
                                  MWK {w.availableBalance.toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-emerald-700 text-sm">
                                  MWK {w.requestedAmount.toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-[#1d1a24]">{w.payoutMethod}</div>
                                  <div className="text-[10px] font-mono text-[#7b7486]">{w.accountNumber}</div>
                                </td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                      w.status === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800 animate-pulse'
                                    }`}
                                  >
                                    {w.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  {w.status === 'Pending Approval' ? (
                                    <button
                                      onClick={() => handleApproveAffiliateWithdrawal(w.id)}
                                      className="px-3 py-1.5 bg-[#5300b7] hover:bg-[#6d28d9] text-white font-bold text-[10px] rounded-xl transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                                    >
                                      Approve &amp; Pay
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                      Disbursed
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Traffic & Clicks Log */}
                {affiliateSubTab === 'clicks-traffic' && (
                  <div className="bg-white rounded-3xl border border-[#ccc3d7]/40 shadow-xs overflow-hidden">
                    <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">
                          Affiliate Link Clicks &amp; Traffic Conversion Audit
                        </h3>
                        <p className="text-xs text-[#7b7486]">
                          Live referral clicks, traffic sources, and checkout conversions
                        </p>
                      </div>
                      <span className="text-xs text-[#5300b7] font-bold bg-[#f3ebf9] px-3 py-1 rounded-full">
                        Logged Clicks: {clickLogsList.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#fef7ff] border-b border-[#ccc3d7]/30 text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">
                            <th className="p-4">Click Ref</th>
                            <th className="p-4">Date &amp; Time</th>
                            <th className="p-4">Affiliate Promoter</th>
                            <th className="p-4">Promoted Product</th>
                            <th className="p-4">Traffic Source</th>
                            <th className="p-4 text-center">Converted Sale</th>
                            <th className="p-4 text-right">Commission Earned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc3d7]/20">
                          {filteredClickLogs.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-[#7b7486]">
                                No click logs found for this search.
                              </td>
                            </tr>
                          ) : (
                            filteredClickLogs.map((c) => (
                              <tr key={c.id} className="hover:bg-[#fef7ff]/60 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#5300b7]">{c.id}</td>
                                <td className="p-4 text-[#4a4455]">{c.date}</td>
                                <td className="p-4">
                                  <div className="font-bold text-[#1d1a24]">{c.affiliateName}</div>
                                  <div className="text-[10px] font-mono text-[#5300b7]">{c.doloCode}</div>
                                </td>
                                <td className="p-4 font-medium text-[#1d1a24]">{c.productName}</td>
                                <td className="p-4 text-[#4a4455] font-medium">{c.trafficSource}</td>
                                <td className="p-4 text-center">
                                  {c.converted ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                                      Yes (Sale)
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                                      Click Only
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-right font-serif-source font-bold text-emerald-700">
                                  MWK {c.commissionEarned.toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ==================== WITHDRAWALS TAB ==================== */}
          {activeNav === 'withdrawals' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Seller &amp; Affiliate Withdrawals</h3>
                  <p className="text-xs text-[#4a4455]">Review and disburse payout requests via Mobile Money or Bank Transfer.</p>
                </div>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 font-extrabold text-xs rounded-full">
                  14 PENDING REQUESTS
                </span>
              </div>

              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <p className="font-bold text-xs text-amber-900">Immediate Settlement Notice</p>
                <p className="text-xs text-amber-800">
                  Total payout volume pending approval: <span className="font-bold">MWK 450,000</span> across Airtel Money &amp; TNM Mpamba.
                </p>
                <button
                  onClick={() => onShowToast('Approved batch withdrawal payout!')}
                  className="mt-2 bg-[#5300b7] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#6d28d9] cursor-pointer"
                >
                  PROCESS ALL BATCH PAYOUTS
                </button>
              </div>
            </div>
          )}

          {/* ==================== USERS TAB ==================== */}
          {activeNav === 'users' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">User Accounts &amp; Access Control</h3>
              <p className="text-xs text-[#4a4455]">
                12,500 registered buyer and seller accounts across Lilongwe, Blantyre, Mzuzu, and Zomba.
              </p>
            </div>
          )}

          {/* ==================== PROMOS TAB ==================== */}
          {activeNav === 'promos' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Promotional Campaigns &amp; Vouchers</h3>
              <p className="text-xs text-[#4a4455]">
                Manage discount vouchers, zero-commission seller periods, and holiday banners.
              </p>
            </div>
          )}

          {/* ==================== NOTIFY TAB ==================== */}
          {activeNav === 'notify' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">System Broadcasts &amp; SMS Alerts</h3>
              <p className="text-xs text-[#4a4455]">
                Send push notifications and SMS updates directly to sellers or buyers.
              </p>
              <div className="space-y-3 pt-2 max-w-lg">
                <input
                  type="text"
                  placeholder="Broadcast Headline..."
                  className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3 py-2 text-xs font-bold"
                />
                <textarea
                  rows={3}
                  placeholder="Type broadcast announcement text..."
                  className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl p-3 text-xs"
                />
                <button
                  onClick={() => onShowToast('Broadcast notification sent to all active users!')}
                  className="bg-[#5300b7] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#6d28d9] cursor-pointer"
                >
                  SEND BROADCAST NOW
                </button>
              </div>
            </div>
          )}

          {/* ==================== INBOX TAB ==================== */}
          {activeNav === 'inbox' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ccc3d7]/40 shadow-xs space-y-4">
              <h3 className="font-serif-source text-2xl font-bold text-[#1d1a24]">Support &amp; Admin Inbox</h3>
              <p className="text-xs text-[#4a4455]">
                Review customer inquiries, seller dispute tickets, and system automated logs.
              </p>
            </div>
          )}

      {/* ==================== UPLOAD NEW PRODUCT MODAL ==================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#ccc3d7]/40 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5300b7] text-white rounded-xl">
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                </div>
                <div>
                  <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">Upload New Product</h3>
                  <p className="text-xs text-[#7b7486]">Add a new item to the live marketplace catalog</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1.5 text-[#4a4455] hover:text-[#1d1a24] hover:bg-[#f3ebf9] rounded-xl cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProductForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    placeholder="e.g. Leather Bifold Wallet - Cognac"
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value as any })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30 cursor-pointer"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Automobiles">Automobiles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Luxury Bags">Luxury Bags</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Timepieces">Timepieces</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    PRICE (MWK) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    STOCK QUANTITY *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Merchant / Seller Name */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    MERCHANT / SELLER
                  </label>
                  <input
                    type="text"
                    value={productFormData.sellerName}
                    onChange={(e) => setProductFormData({ ...productFormData, sellerName: e.target.value })}
                    placeholder="e.g. Pa_mSikA Verified Direct"
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    PROMO BADGE (OPTIONAL)
                  </label>
                  <select
                    value={productFormData.badge}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value as any })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30 cursor-pointer"
                  >
                    <option value="">None</option>
                    <option value="HOT">HOT</option>
                    <option value="NEW">NEW</option>
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                    <option value="FEATURED">FEATURED</option>
                  </select>
                </div>

                {/* Commission */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    AFFILIATE COMMISSION %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productFormData.commission}
                    onChange={(e) => setProductFormData({ ...productFormData, commission: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    placeholder="Enter detailed product specs, features, material, warranty..."
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl p-3 text-xs text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Image Upload / URL */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase">
                    PRODUCT IMAGE
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="text"
                      value={productFormData.image}
                      onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                      placeholder="Paste Image URL or pick local file..."
                      className="flex-1 w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none"
                    />
                    <label className="w-full sm:w-auto px-4 py-2.5 bg-[#f3ebf9] text-[#5300b7] hover:bg-[#ebddff] rounded-xl font-bold text-xs cursor-pointer text-center shrink-0">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                  </div>

                  {/* Preset quick image selection */}
                  <div>
                    <span className="text-[10px] font-bold text-[#7b7486] block mb-1">Quick Sample Image Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {samplePresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setProductFormData({ ...productFormData, image: preset.url })}
                          className="px-2.5 py-1 bg-[#f3ebf9] hover:bg-[#5300b7] hover:text-white text-[#5300b7] text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Image */}
                  {productFormData.image && (
                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src={productFormData.image}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-[#ccc3d7]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Image Ready
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#ccc3d7]/30 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#ccc3d7] text-[#4a4455] font-bold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition-colors cursor-pointer uppercase tracking-wider"
                >
                  UPLOAD PRODUCT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT PRODUCT MODAL ==================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#ccc3d7]/40 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-[#fef7ff] border-b border-[#ccc3d7]/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5300b7] text-white rounded-xl">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">Edit Product</h3>
                  <p className="text-xs text-[#7b7486]">Update details for {editingProduct.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-[#4a4455] hover:text-[#1d1a24] hover:bg-[#f3ebf9] rounded-xl cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProductForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value as any })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none cursor-pointer"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Automobiles">Automobiles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Luxury Bags">Luxury Bags</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Timepieces">Timepieces</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    PRICE (MWK) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    STOCK QUANTITY *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none"
                  />
                </div>

                {/* Merchant Name */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    MERCHANT / SELLER
                  </label>
                  <input
                    type="text"
                    value={productFormData.sellerName}
                    onChange={(e) => setProductFormData({ ...productFormData, sellerName: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none"
                  />
                </div>

                {/* Promo Badge */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    PROMO BADGE
                  </label>
                  <select
                    value={productFormData.badge}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value as any })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none cursor-pointer"
                  >
                    <option value="">None</option>
                    <option value="HOT">HOT</option>
                    <option value="NEW">NEW</option>
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                    <option value="FEATURED">FEATURED</option>
                  </select>
                </div>

                {/* Commission */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    AFFILIATE COMM %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productFormData.commission}
                    onChange={(e) => setProductFormData({ ...productFormData, commission: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase mb-1">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl p-3 text-xs text-[#1d1a24] focus:outline-none"
                  />
                </div>

                {/* Image */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-[#7b7486] uppercase">
                    IMAGE URL / FILE
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="text"
                      value={productFormData.image}
                      onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                      className="flex-1 w-full bg-[#fef7ff] border border-[#ccc3d7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1d1a24] focus:outline-none"
                    />
                    <label className="w-full sm:w-auto px-4 py-2.5 bg-[#f3ebf9] text-[#5300b7] hover:bg-[#ebddff] rounded-xl font-bold text-xs cursor-pointer text-center shrink-0">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                  </div>

                  {/* Preview Image */}
                  {productFormData.image && (
                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src={productFormData.image}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-[#ccc3d7]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Image Updated
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#ccc3d7]/30 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#ccc3d7] text-[#4a4455] font-bold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#5300b7] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition-colors cursor-pointer uppercase tracking-wider"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-serif-source font-bold text-lg text-[#1d1a24]">Delete Product</h3>
                <p className="text-xs text-[#7b7486]">Confirm removal from live marketplace</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#fef7ff] rounded-2xl border border-[#ccc3d7]/30 flex items-center gap-3">
              <img
                src={deletingProduct.image}
                alt={deletingProduct.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#ccc3d7] bg-white shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-[#1d1a24] truncate">{deletingProduct.name}</p>
                <p className="text-[11px] font-bold text-[#5300b7]">MWK {deletingProduct.price.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-xs text-[#4a4455] leading-relaxed">
              Are you sure you want to permanently delete this product? Buyers will no longer be able to view or order this item.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#ccc3d7]/30">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-[#ccc3d7] text-[#4a4455] font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer uppercase tracking-wider"
              >
                DELETE PRODUCT
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

