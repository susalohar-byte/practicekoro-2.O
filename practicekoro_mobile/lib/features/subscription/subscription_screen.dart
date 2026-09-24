import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../data/datasources/local_storage.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  late Razorpay _razorpay;
  int _selectedPlanIndex = 2; // 0: 1 Month (₹99), 1: 6 Months (₹199), 2: 1 Year (₹299)
  bool _isProcessing = false;

  // Coupon Code State
  final TextEditingController _couponController = TextEditingController();
  String? _appliedCouponCode;
  int _discountAmount = 0;
  String? _couponError;

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'plan_1_month',
      'title': '1 Month Pass',
      'duration': '30 Days',
      'price': 99,
      'originalPrice': 199,
      'discount': '50% OFF',
      'badge': null,
    },
    {
      'id': 'plan_6_month',
      'title': '6 Months Pass',
      'duration': '180 Days',
      'price': 199,
      'originalPrice': 499,
      'discount': '60% OFF',
      'badge': 'Great Value',
    },
    {
      'id': 'pro_1_year',
      'title': '1 Year Pro Pass',
      'duration': '365 Days',
      'price': 299,
      'originalPrice': 999,
      'discount': '70% OFF',
      'badge': '👑 Most Popular',
    },
  ];

  final List<String> _features = [
    'Universal access to ALL Mock Tests across Bengal exams',
    'Previous Year Question (PYQ) Papers with solutions',
    'Detailed solutions & bilingual Bengali explanations',
    'Automated Mistakes Notebook & Smart Revision',
    'All-Bengal Rank, Accuracy & Percentile Analytics',
    'Seamless access on both Mobile App & Website',
  ];

  @override
  void initState() {
    super.initState();
    _initRazorpay();
  }

  void _initRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    _couponController.dispose();
    super.dispose();
  }

  int get _basePlanPrice => _plans[_selectedPlanIndex]['price'] as int;

  int get _finalPayablePrice {
    final net = _basePlanPrice - _discountAmount;
    return net > 0 ? net : 1; // Minimum ₹1 for gateway validation
  }

  void _applyCoupon() {
    final code = _couponController.text.trim().toUpperCase();
    if (code.isEmpty) {
      setState(() => _couponError = 'Please enter a coupon code');
      return;
    }

    int discount = 0;
    final basePrice = _basePlanPrice;

    if (code == 'PRACTICE50') {
      discount = (basePrice * 0.50).round();
    } else if (code == 'WELCOME100') {
      discount = basePrice > 100 ? 100 : (basePrice * 0.50).round();
    } else if (code == 'PRO20') {
      discount = (basePrice * 0.20).round();
    } else if (code == 'SUSANTA') {
      discount = (basePrice * 0.40).round();
    } else {
      setState(() {
        _couponError = 'Invalid coupon code. Try PRACTICE50 or WELCOME100.';
      });
      return;
    }

    setState(() {
      _appliedCouponCode = code;
      _discountAmount = discount;
      _couponError = null;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        content: Text('🎉 Coupon $code applied! You saved ₹$discount!'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _removeCoupon() {
    setState(() {
      _appliedCouponCode = null;
      _discountAmount = 0;
      _couponController.clear();
      _couponError = null;
    });
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    setState(() => _isProcessing = false);

    final selectedPlan = _plans[_selectedPlanIndex];
    final int days = selectedPlan['id'] == 'pro_1_year'
        ? 365
        : selectedPlan['id'] == 'plan_6_month'
            ? 180
            : 30;

    final expiryDate = DateTime.now().add(Duration(days: days));
    await LocalStorageService.setProUser(true, expiresAt: expiryDate);

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                ),
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 44),
            ),
            const SizedBox(height: 16),
            const Text(
              'Payment Successful!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.navy),
            ),
            const SizedBox(height: 8),
            Text(
              'Your ${selectedPlan['title']} is now active! All premium mock tests and solutions are unlocked.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            if (_appliedCouponCode != null) ...[
              const SizedBox(height: 8),
              Text(
                'Coupon applied: $_appliedCouponCode (Saved ₹$_discountAmount)',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
              ),
            ],
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Payment ID: ${response.paymentId ?? "CONFIRMED"}',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.go('/home');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Start Practicing', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    setState(() => _isProcessing = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFFEF4444),
        content: Text(
          response.message?.isNotEmpty == true
              ? 'Payment failed: ${response.message}'
              : 'Payment cancelled or could not be completed.',
        ),
        action: SnackBarAction(
          label: 'Retry UPI',
          textColor: Colors.white,
          onPressed: _openWebCheckout,
        ),
      ),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    setState(() => _isProcessing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('External Wallet selected: ${response.walletName}')),
    );
  }

  void _startPayment() {
    final selectedPlan = _plans[_selectedPlanIndex];
    final int payableAmount = _finalPayablePrice;

    setState(() => _isProcessing = true);

    final options = {
      'key': AppConstants.razorpayKeyId,
      'amount': payableAmount * 100, // Amount in paise (discounted)
      'name': 'PracticeKoro',
      'description': '${selectedPlan['title']} (${selectedPlan['duration']})',
      'currency': 'INR',
      'prefill': {
        'contact': AppConstants.supportPhone.replaceAll('+', ''),
        'email': 'student@practicekoro.in',
      },
      'theme': {
        'color': '#0158FC',
      },
      'retry': {
        'enabled': true,
        'max_count': 3,
      },
      'send_sms_hash': true,
      'external': {
        'wallets': ['paytm'],
      },
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      setState(() => _isProcessing = false);
      _openWebCheckout();
    }
  }

  Future<void> _openWebCheckout() async {
    final uri = Uri.parse('${AppConstants.websiteUrl}/subscription');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please visit https://practicekoro.online to subscribe')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPro = LocalStorageService.isProUser();
    final selectedPlan = _plans[_selectedPlanIndex];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.navy),
          onPressed: () => context.pop(),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Upgrade to Pro Pass',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: AppColors.navy,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_browser_rounded, size: 20, color: AppColors.navy),
            tooltip: 'Open in Website',
            onPressed: _openWebCheckout,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  // Gold Crown Header Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                            ),
                          ),
                          child: const Icon(
                            Icons.workspace_premium_rounded,
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isPro ? '👑 You are a Pro Member' : '👑 PracticeKoro Pro Pass',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF92400E),
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                isPro
                                    ? 'Enjoy unlimited access to all tests & solutions'
                                    : 'Unlimited Full Mocks, Chapter PYQs & Bilingual Solutions',
                                style: const TextStyle(fontSize: 12, color: Color(0xFFB45309)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  const Text(
                    'Choose Your Subscription Plan',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.navy,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // 3 Plan Selection Cards
                  ...List.generate(_plans.length, (idx) {
                    final plan = _plans[idx];
                    final isSelected = _selectedPlanIndex == idx;
                    final badge = plan['badge'] as String?;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _selectedPlanIndex = idx;
                            // Recalculate coupon if applied
                            if (_appliedCouponCode != null) {
                              _applyCoupon();
                            }
                          });
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                              width: isSelected ? 2 : 1,
                            ),
                            boxShadow: [
                              if (isSelected)
                                BoxShadow(
                                  color: const Color(0xFF2563EB).withValues(alpha: 0.08),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                            ],
                          ),
                          child: Row(
                            children: [
                              // Radio selection circle
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1),
                                    width: isSelected ? 5 : 2,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),

                              // Plan Details
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          plan['title'] as String,
                                          style: TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: isSelected ? const Color(0xFF1E3A8A) : AppColors.navy,
                                          ),
                                        ),
                                        if (badge != null) ...[
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFEF3C7),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              badge,
                                              style: const TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFFB45309),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Valid for ${plan['duration']} • ${plan['discount']}',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                              ),

                              // Price
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '₹${plan['price']}',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w900,
                                      color: isSelected ? const Color(0xFF2563EB) : AppColors.navy,
                                    ),
                                  ),
                                  Text(
                                    '₹${plan['originalPrice']}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Color(0xFF94A3B8),
                                      decoration: TextDecoration.lineThrough,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),

                  const SizedBox(height: 16),

                  // ===============================
                  // COUPON CODE APPLICATION CARD
                  // ===============================
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _appliedCouponCode != null
                            ? const Color(0xFF10B981)
                            : const Color(0xFFE2E8F0),
                        width: _appliedCouponCode != null ? 1.5 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.local_offer_rounded,
                              color: _appliedCouponCode != null
                                  ? const Color(0xFF10B981)
                                  : AppColors.primary,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Have a Coupon Code?',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.navy,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        if (_appliedCouponCode == null) ...[
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  height: 46,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFCBD5E1)),
                                  ),
                                  child: TextField(
                                    controller: _couponController,
                                    textCapitalization: TextCapitalization.characters,
                                    decoration: const InputDecoration(
                                      hintText: 'Enter code (e.g. PRACTICE50)',
                                      hintStyle: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                                      border: InputBorder.none,
                                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton(
                                onPressed: _applyCoupon,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                                child: const Text('Apply', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          if (_couponError != null) ...[
                            const SizedBox(height: 6),
                            Text(
                              _couponError!,
                              style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444), fontWeight: FontWeight.w600),
                            ),
                          ],
                          const SizedBox(height: 8),
                          // Quick coupon pills
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _buildQuickCouponChip('PRACTICE50 (50% OFF)'),
                                const SizedBox(width: 6),
                                _buildQuickCouponChip('WELCOME100 (₹100 OFF)'),
                                const SizedBox(width: 6),
                                _buildQuickCouponChip('PRO20 (20% OFF)'),
                              ],
                            ),
                          ),
                        ] else ...[
                          // Coupon Applied Success Box
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFA7F3D0)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 22),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Coupon "$_appliedCouponCode" Applied!',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF065F46),
                                        ),
                                      ),
                                      Text(
                                        'You saved ₹$_discountAmount on this plan',
                                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF047857)),
                                      ),
                                    ],
                                  ),
                                ),
                                TextButton(
                                  onPressed: _removeCoupon,
                                  child: const Text(
                                    'Remove',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFFEF4444),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Features Checklist Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'What You Will Get With Pro Pass:',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.navy,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._features.map((feature) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 5),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  margin: const EdgeInsets.only(top: 2),
                                  padding: const EdgeInsets.all(3),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF10B981),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.check, color: Colors.white, size: 10),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    feature,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF334155),
                                      height: 1.35,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 100% Safe & Secure Payment Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.security_rounded, size: 16, color: Color(0xFF10B981)),
                      const SizedBox(width: 6),
                      Text(
                        '100% Secure Checkout via Razorpay • UPI / Cards / NetBanking',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),

            // Bottom Sticky Checkout Bar (Dynamic Discount Calculation)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Total Payable',
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '₹$_finalPayablePrice',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: AppColors.navy,
                            ),
                          ),
                          if (_discountAmount > 0) ...[
                            const SizedBox(width: 6),
                            Text(
                              '₹$_basePlanPrice',
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF94A3B8),
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                          const SizedBox(width: 4),
                          Text(
                            '(${selectedPlan['duration']})',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : _startPayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: _isProcessing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.flash_on_rounded, size: 18),
                                const SizedBox(width: 6),
                                Text(
                                  _discountAmount > 0
                                      ? 'Pay ₹$_finalPayablePrice (Razorpay)'
                                      : 'Pay with Razorpay / UPI',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickCouponChip(String text) {
    final code = text.split(' ')[0];
    return GestureDetector(
      onTap: () {
        _couponController.text = code;
        _applyCoupon();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFEFF6FF),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFBFDBFE)),
        ),
        child: Text(
          text,
          style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
      ),
    );
  }
}
