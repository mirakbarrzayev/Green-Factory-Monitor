import { useState, useEffect, useRef } from "react";

// ─── LANGUAGE DICTIONARY ──────────────────────────────────────────────────────
const LANGUAGES = {
  "🇦🇿 Azərbaycan": {
    // Auth
    lang_label: "Dil / Language / Dil",
    signin: "Daxil ol",
    signup: "Qeydiyyat",
    welcome: "Xoş gəldiniz!",
    welcome_sub: "Sistemə daxil olmaq üçün məlumatlarınızı daxil edin",
    register_title: "Hesab yaradın",
    register_sub: "Green Factory platformasına qoşulun",
    email: "Email",
    password: "Şifrə",
    password_min: "(min. 8 simvol)",
    confirm_pw: "Şifrəni təsdiqləyin",
    first_name: "Ad",
    last_name: "Soyad",
    placeholder_email: "adınız@gmail.com",
    placeholder_pw: "Şifrənizi daxil edin",
    placeholder_pw_new: "Şifrə yaradın",
    placeholder_pw_confirm: "Şifrəni təkrar daxil edin",
    placeholder_fn: "Adınız",
    placeholder_ln: "Soyadınız",
    signin_btn: "Daxil ol →",
    signup_btn: "Qeydiyyatdan keç →",
    checking: "Yoxlanılır...",
    creating: "Hesab yaradılır...",
    auth_error: "Giriş məlumatları yanlışdır. Yenidən cəhd edin.",
    err_email: "Düzgün email daxil edin",
    err_email_exists: "Bu email artıq qeydiyyatdadır",
    err_name_exists: "Bu ad/soyad artıq istifadə olunur",
    err_fname: "Ad tələb olunur",
    err_lname: "Soyad tələb olunur",
    err_pw_len: "Şifrə minimum 8 simvol olmalıdır",
    err_pw_match: "Şifrələr uyğun gəlmir",
    err_email_req: "Email tələb olunur",
    err_pw_req: "Şifrə tələb olunur",
    user_not_found: "Bu email ilə istifadəçi tapılmadı",
    wrong_pw: "Şifrə yanlışdır. Yenidən cəhd edin",
    // Sidebar
    section_main: "Əsas",
    section_panels: "Panellər",
    section_analytics: "Analitika",
    section_system: "Sistem",
    nav_overview: "İcmal",
    nav_energy: "Enerji Sərfiyyatı",
    nav_water: "Su Sərfiyyatı",
    nav_emissions: "Karbon Emissiyası",
    nav_transport: "Nəqliyyat",
    nav_food: "Qida Resursları",
    nav_map: "Fabrik Xəritəsi",
    nav_carbon: "Karbon Kalk.",
    nav_reports: "Hesabatlar",
    nav_weekly: "Həftəlik Hesabatlar",
    nav_security: "Təhlükəsizlik",
    nav_settings: "Ayarlar",
    nav_support: "Əlaqə & Dəstək",
    role_admin: "Zavod Administratoru",
    role_user: "İstifadəçi",
    role_operator: "Operator",
    logout: "Çıxış",
    live: "Canlı",
    // Overview
    page_overview: "Sistem İcmalı",
    greeting: "Salam",
    all_active: "Bütün sistemlər aktiv",
    energy_label: "Enerji Sərfiyyatı",
    water_label: "Su İstifadəsi",
    co2_label: "Karbon Emissiyası",
    green_score: "Yaşıl Bal",
    energy_trend: "Enerji Trendi",
    energy_trend_sub: "Son 20 ölçüm — hər 3 saniyədə yenilənir",
    water_indicator: "Su Göstəricisi",
    energy_hist: "Enerji Histoqramı",
    co2_trend: "CO₂ Trendi",
    water_trend: "Su Trendi",
    renewable: "Bərpa Olunan Enerji",
    solar_share: "Günəş Enerjisi payı",
    wind_energy: "Külək Enerjisi",
    wind_share: "Külək enerjisi payı",
    grid_energy: "Şəbəkə Enerjisi",
    grid_share: "Şəbəkə payı",
    sec_kpi: "Xüsusi Enerji Sərfiyyatı (SEC)",
    sec_unit: "kWh/vahid",
    sec_label: "1 Məhsul üçün enerji",
    prod_count: "Məhsul Sayı (bu gün)",
    // Energy
    page_energy: "Enerji Sərfiyyatı",
    energy_current: "kWh — Cari",
    energy_avg: "kWh — Ortalama",
    energy_peak: "kWh — Pik",
    energy_timeline: "Enerji Sərfiyyatı — Zaman Cədvəli",
    shift_analysis: "Növbəyə Görə Enerji Analizi",
    shift_morning: "Səhər növbəsi",
    shift_afternoon: "Günorta növbəsi",
    shift_night: "Gecə növbəsi",
    shift_time_m: "08:00–16:00",
    shift_time_a: "16:00–00:00",
    shift_time_n: "00:00–08:00",
    shift_avg: "Orta sərfiyyat",
    // Water
    page_water: "Su Sərfiyyatı",
    water_current: "Litr — Cari",
    water_avg: "Litr — Ortalama",
    water_peak: "Litr — Pik",
    water_trend_title: "Su İstifadəsi Trendi",
    water_level: "Cari Dolluq Səviyyəsi",
    // Emissions
    page_emissions: "Karbon Emissiyası",
    co2_current: "kg CO₂ — Cari",
    co2_avg: "kg CO₂ — Ortalama",
    co2_total: "kg CO₂ — Ümumi",
    co2_trend_title: "CO₂ Emissiya Trendi",
    // Transport
    page_transport: "Nəqliyyat Paneli",
    transport_sub: "Logistika və yanacaq səmərəliliyi",
    active_vehicles: "Aktiv Nəqliyyat Vasitəsi",
    avg_efficiency: "Orta Yanacaq Səmərəliliyi",
    daily_km: "Günlük km",
    vehicle_list: "Nəqliyyat Siyahısı",
    fuel_trend: "Yanacaq Trendi",
    // Food
    page_food: "Qida Paneli",
    food_sub: "Tullantı azaldılması və resurs idarəetməsi",
    waste_target: "Tullantı Azaldılması Hədəfi",
    // Carbon calc
    page_carbon: "Karbon Kalkulyatoru",
    carbon_sub: "Real-vaxt CO₂ emissiya hesablaması",
    carbon_input: "Məlumatları daxil edin",
    carbon_energy: "Enerji (kWh)",
    carbon_fuel: "Yanacaq (Litr)",
    carbon_food: "Qida Tullantısı (kg)",
    carbon_total: "Ümumi CO₂ Emissiyası",
    carbon_unit: "kg CO₂/gün",
    recommendations: "Tövsiyələr",
    tip1: "Enerji sərfiyyatı yüksəkdir. Günəş panelləri ilə 40% qənaət edin.",
    tip2: "Yanacaq istehlakı artıqdır. Elektrik nəqliyyatına keçidi düşünün.",
    tip3: "Qida tullantısı yüksəkdir. Kompost sistemi qurun, 30% azaldın.",
    tip4: "Ümumi emissiya kritik həddədir. 50 ağac əkmək bu emissiyaları kompensasiya edər.",
    tip_ok: "Əla! Emissiya göstəriciləriniz qənaətbəxşdir. Bu tempi saxlayın.",
    // Reports
    page_reports: "Sistem Hesabatları",
    auto_reports: "Avtomatik Hesabatlar",
    system_status: "Sistem Vəziyyəti",
    ready: "Hazır",
    waiting: "Gözlənilir",
    normal: "Normal",
    active_status: "Aktiv",
    connected: "Bağlı",
    pdf_download: "📄 PDF Hesabat Yüklə",
    // Weekly
    page_weekly: "Həftəlik Resurs Hesabatları",
    weekly_sub: "Həftəlik resurs istehlakı və emissiya izləmə",
    weekly_form_title: "Həftəlik Məlumat Daxiletmə",
    weekly_current_week: "Cari Həftə",
    weekly_energy: "Enerji (kWh)",
    weekly_water: "Su (m³)",
    weekly_gas: "Qaz (m³)",
    weekly_fuel: "Yanacaq (Litr)",
    weekly_co2_auto: "Hesablanmış CO₂ Emissiyası (kg)",
    weekly_save: "Həftəlik Məlumatı Saxla",
    weekly_already: "Bu həftənin məlumatları artıq daxil edilib. Növbəti həftə yenidən aktivləşəcək.",
    weekly_admin_override: "Admin olaraq üzərindən yaz",
    weekly_saved: "✅ Məlumatlar uğurla saxlanıldı!",
    weekly_trend: "Həftəlik Resurs Trendi",
    weekly_shift_trend: "Həftəlik Növbə Enerji Trendi",
    weekly_shift_section: "Növbə Üzrə Enerji (kWh)",
    weekly_shift_morning: "Səhər Növbəsi (kWh)",
    weekly_shift_afternoon: "Günorta Növbəsi (kWh)",
    weekly_shift_night: "Gecə Növbəsi (kWh)",
    weekly_no_data: "Hələ məlumat yoxdur. Yuxarıdakı formu doldurun.",
    week_label: "Həftə",
    about_author: "GREEN PLUS",
    // Security
    page_security: "Təhlükəsizlik & Alertlər",
    security_sub: "Threshold monitorinqi — real vaxt xəbərdarlıq sistemi",
    total_alerts: "Ümumi alert",
    critical: "Kritik",
    warning: "Xəbərdarlıq",
    today: "Bu gün",
    tab_status: "🔍 Cari Status",
    tab_history: "📋 Alert Tarixi",
    tab_config: "⚙️ Hədd Konfiqurasiyası",
    all_normal: "Bütün sistemlər normal işləyir",
    all_normal_sub: "Heç bir threshold aşılmayıb — sistemlər stabildir",
    history_empty: "Alert tarixi boşdur",
    history_empty_sub: "Threshold aşıldıqda bura yazılacaq",
    active_warnings: "aktiv xəbərdarlıq",
    thresh_readonly: "Threshold dəyişdirmək icazəsi yalnız Admin hesabına məxsusdur.",
    save_config: "💾 Hədləri Yadda Saxla",
    saved_ok: "✅ Yadda saxlanıldı!",
    critical_badge: "KRİTİK",
    warning_badge: "XƏBƏR",
    // Settings
    page_settings: "Ayarlar & Fərdiləşdirmə",
    profile: "Profil",
    full_name: "Ad Soyad",
    role: "Rol",
    change_pw: "Şifrəni Dəyiş",
    old_pw: "Köhnə Şifrə",
    new_pw: "Yeni Şifrə",
    confirm_new_pw: "Yeni Şifrəni Təsdiqləyin",
    placeholder_old_pw: "Mövcud şifrənizi daxil edin",
    placeholder_new_pw: "Yeni şifrənizi daxil edin",
    placeholder_repeat_pw: "Yeni şifrəni təkrarlayın",
    pw_change_btn: "Şifrəni Dəyiş →",
    pw_updating: "Yenilənir...",
    err_old_pw: "Köhnə şifrə tələb olunur",
    err_old_pw_wrong: "Köhnə şifrə yanlışdır",
    pw_changed_ok: "Şifrə uğurla dəyişdirildi!",
    appearance: "Görünüş",
    theme_select: "Tema seçimi",
    theme_desc: "Tətbiqin rəng sxemini seçin",
    dark: "Tünd",
    light: "İşıqlı",
    notifications: "Bildiriş Sistemi",
    energy_notif: "Enerji Limiti Xəbərdarlığı",
    energy_notif_desc: "80% enerji limiti aşıldıqda bildir",
    co2_notif: "CO₂ Emissiya Xəbərdarlığı",
    co2_notif_desc: "Emissiya kritik həddə çatdıqda bildir",
    water_notif: "Su Limiti Xəbərdarlığı",
    water_notif_desc: "Su istehlakı limitini keçdikdə bildir",
    weekly_notif: "Həftəlik Hesabat",
    weekly_notif_desc: "Hər həftə email ilə hesabat göndər",
    about: "Haqqında",
    about_desc: "Green Factory Dashboard — sənaye müəssisələri üçün hərtərəfli dayanıqlılıq monitorinq platforması. Real-vaxt enerji, su, karbon emissiyası, nəqliyyat və qida resurs idarəetməsi imkanları.",
    // Support
    page_support: "Əlaqə & Dəstək",
    support_sub: "Bizə yazın, dəstək alın",
    contact_info: "Əlaqə Məlumatları",
    contact_email: "Email",
    contact_phone: "Telefon",
    ticket_form: "Dəstək Talebi",
    ticket_name: "Ad-Soyad",
    ticket_subject: "Mövzu",
    ticket_message: "Mesaj",
    ticket_urgency: "Təcililik",
    urgency_low: "Aşağı",
    urgency_medium: "Orta",
    urgency_high: "Yüksək",
    ticket_send: "Göndər",
    ticket_sending: "Göndərilir...",
    ticket_sent: "✅ Mesajınız göndərildi!",
    ticket_history: "Göndərilmiş Talеblər",
    ticket_empty: "Hələ göndərilmiş taleb yoxdur.",
    // pw strength
    pw_weak: "Zəif",
    pw_medium: "Orta",
    pw_strong: "Güclü",
    pw_very_strong: "Çox Güclü",
    // alert banner
    alert_energy: "Enerji sərfiyyatı kritik həddə çatıb",
    alert_security: "→ Təhlükəsizlik",
    // features
    feat_energy: "Real-vaxt Enerji Monitorinqi",
    feat_water: "Su İstifadəsi Analizi",
    feat_co2: "CO₂ Emissiya İzləmə",
    feat_security: "Kiber-Təhlükəsizlik Auditi",
    headline1: "Daha Ağıllı.",
    headline2: "Daha Yaşıl.",
    headline3: "Daha Güclü.",
    hero_sub: "Sənaye müəssisənizin enerji, su və karbon göstəricilərini real vaxt rejimində izləyin. Bərpa olunan enerji, nəqliyyat və qida tullantılarını idarə edin.",
  },
  "🇬🇧 English": {
    lang_label: "Language / Dil / Dil",
    signin: "Sign In",
    signup: "Sign Up",
    welcome: "Welcome back!",
    welcome_sub: "Enter your credentials to access the system",
    register_title: "Create Account",
    register_sub: "Join the Green Factory platform",
    email: "Email",
    password: "Password",
    password_min: "(min. 8 chars)",
    confirm_pw: "Confirm Password",
    first_name: "First Name",
    last_name: "Last Name",
    placeholder_email: "yourname@gmail.com",
    placeholder_pw: "Enter your password",
    placeholder_pw_new: "Create a password",
    placeholder_pw_confirm: "Repeat new password",
    placeholder_fn: "Your first name",
    placeholder_ln: "Your last name",
    signin_btn: "Sign In →",
    signup_btn: "Create Account →",
    checking: "Checking...",
    creating: "Creating account...",
    auth_error: "Authentication failed. Please try again.",
    err_email: "Enter a valid email address",
    err_email_exists: "This email is already registered",
    err_name_exists: "This name is already taken",
    err_fname: "First name is required",
    err_lname: "Last name is required",
    err_pw_len: "Password must be at least 8 characters",
    err_pw_match: "Passwords do not match",
    err_email_req: "Email is required",
    err_pw_req: "Password is required",
    user_not_found: "No user found with this email",
    wrong_pw: "Incorrect password. Please try again",
    section_main: "Main",
    section_panels: "Panels",
    section_analytics: "Analytics",
    section_system: "System",
    nav_overview: "Overview",
    nav_energy: "Energy Usage",
    nav_water: "Water Usage",
    nav_emissions: "Carbon Emissions",
    nav_transport: "Transport",
    nav_food: "Food Resources",
    nav_map: "Factory Map",
    nav_carbon: "Carbon Calc.",
    nav_reports: "Reports",
    nav_weekly: "Weekly Reports",
    nav_security: "Security",
    nav_settings: "Settings",
    nav_support: "Contact & Support",
    role_admin: "Plant Administrator",
    role_user: "User",
    role_operator: "Operator",
    logout: "Logout",
    live: "Live",
    page_overview: "System Overview",
    greeting: "Hello",
    all_active: "All systems active",
    energy_label: "Energy Consumption",
    water_label: "Water Usage",
    co2_label: "Carbon Emissions",
    green_score: "Green Score",
    energy_trend: "Energy Trend",
    energy_trend_sub: "Last 20 readings — updated every 3 seconds",
    water_indicator: "Water Level",
    energy_hist: "Energy Histogram",
    co2_trend: "CO₂ Trend",
    water_trend: "Water Trend",
    renewable: "Renewable Energy",
    solar_share: "Solar energy share",
    wind_energy: "Wind Energy",
    wind_share: "Wind energy share",
    grid_energy: "Grid Energy",
    grid_share: "Grid share",
    sec_kpi: "Specific Energy Consumption (SEC)",
    sec_unit: "kWh/unit",
    sec_label: "Energy per product unit",
    prod_count: "Production Count (today)",
    page_energy: "Energy Consumption",
    energy_current: "kWh — Current",
    energy_avg: "kWh — Average",
    energy_peak: "kWh — Peak",
    energy_timeline: "Energy Consumption — Timeline",
    shift_analysis: "Shift-Based Energy Analysis",
    shift_morning: "Morning shift",
    shift_afternoon: "Afternoon shift",
    shift_night: "Night shift",
    shift_time_m: "08:00–16:00",
    shift_time_a: "16:00–00:00",
    shift_time_n: "00:00–08:00",
    shift_avg: "Average consumption",
    page_water: "Water Consumption",
    water_current: "Litre — Current",
    water_avg: "Litre — Average",
    water_peak: "Litre — Peak",
    water_trend_title: "Water Usage Trend",
    water_level: "Current Fill Level",
    page_emissions: "Carbon Emissions",
    co2_current: "kg CO₂ — Current",
    co2_avg: "kg CO₂ — Average",
    co2_total: "kg CO₂ — Total",
    co2_trend_title: "CO₂ Emissions Trend",
    page_transport: "Transport Dashboard",
    transport_sub: "Logistics and fuel efficiency",
    active_vehicles: "Active Vehicles",
    avg_efficiency: "Avg. Fuel Efficiency",
    daily_km: "Daily km",
    vehicle_list: "Vehicle List",
    fuel_trend: "Fuel Trend",
    page_food: "Food Dashboard",
    food_sub: "Waste reduction and resource management",
    waste_target: "Waste Reduction Target",
    page_carbon: "Carbon Calculator",
    carbon_sub: "Real-time CO₂ emission calculation",
    carbon_input: "Enter Data",
    carbon_energy: "Energy (kWh)",
    carbon_fuel: "Fuel (Litres)",
    carbon_food: "Food Waste (kg)",
    carbon_total: "Total CO₂ Emissions",
    carbon_unit: "kg CO₂/day",
    recommendations: "Recommendations",
    tip1: "Energy consumption is high. Save 40% with solar panels.",
    tip2: "Fuel use is excessive. Consider switching to electric vehicles.",
    tip3: "Food waste is high. Set up composting to reduce by 30%.",
    tip4: "Total emissions are critical. Planting 50 trees could offset this.",
    tip_ok: "Great! Your emission indicators are satisfactory. Keep it up.",
    page_reports: "System Reports",
    auto_reports: "Automated Reports",
    system_status: "System Status",
    ready: "Ready",
    waiting: "Pending",
    normal: "Normal",
    active_status: "Active",
    connected: "Connected",
    pdf_download: "📄 Download PDF Report",
    page_weekly: "Weekly Resource Reports",
    weekly_sub: "Weekly resource consumption and emissions tracking",
    weekly_form_title: "Weekly Data Entry",
    weekly_current_week: "Current Week",
    weekly_energy: "Energy (kWh)",
    weekly_water: "Water (m³)",
    weekly_gas: "Gas (m³)",
    weekly_fuel: "Fuel (Litres)",
    weekly_co2_auto: "Calculated CO₂ Emissions (kg)",
    weekly_save: "Save Weekly Data",
    weekly_already: "Data for this week has already been entered. It will be editable again next week.",
    weekly_admin_override: "Admin: Overwrite",
    weekly_saved: "✅ Data saved successfully!",
    weekly_trend: "Weekly Resource Trend",
    weekly_shift_trend: "Weekly Shift Energy Trend",
    weekly_shift_section: "Energy by Shift (kWh)",
    weekly_shift_morning: "Morning Shift (kWh)",
    weekly_shift_afternoon: "Afternoon Shift (kWh)",
    weekly_shift_night: "Night Shift (kWh)",
    weekly_no_data: "No data yet. Fill in the form above.",
    week_label: "Week",
    about_author: "GREEN PLUS",
    page_security: "Security & Alerts",
    security_sub: "Threshold monitoring — real-time alert system",
    total_alerts: "Total Alerts",
    critical: "Critical",
    warning: "Warning",
    today: "Today",
    tab_status: "🔍 Current Status",
    tab_history: "📋 Alert History",
    tab_config: "⚙️ Threshold Config",
    all_normal: "All systems operating normally",
    all_normal_sub: "No threshold breached — systems are stable",
    history_empty: "Alert history is empty",
    history_empty_sub: "Alerts will appear here when thresholds are breached",
    active_warnings: "active warnings",
    thresh_readonly: "Threshold modification permission belongs to Admin only.",
    save_config: "💾 Save Thresholds",
    saved_ok: "✅ Saved!",
    critical_badge: "CRITICAL",
    warning_badge: "WARNING",
    page_settings: "Settings & Customisation",
    profile: "Profile",
    full_name: "Full Name",
    role: "Role",
    change_pw: "Change Password",
    old_pw: "Old Password",
    new_pw: "New Password",
    confirm_new_pw: "Confirm New Password",
    placeholder_old_pw: "Enter your current password",
    placeholder_new_pw: "Enter your new password",
    placeholder_repeat_pw: "Repeat new password",
    pw_change_btn: "Change Password →",
    pw_updating: "Updating...",
    err_old_pw: "Old password is required",
    err_old_pw_wrong: "Old password is incorrect",
    pw_changed_ok: "Password changed successfully!",
    appearance: "Appearance",
    theme_select: "Theme selection",
    theme_desc: "Choose the app's colour scheme",
    dark: "Dark",
    light: "Light",
    notifications: "Notification System",
    energy_notif: "Energy Limit Warning",
    energy_notif_desc: "Notify when 80% energy limit is exceeded",
    co2_notif: "CO₂ Emission Warning",
    co2_notif_desc: "Notify when emissions reach critical level",
    water_notif: "Water Limit Warning",
    water_notif_desc: "Notify when water consumption exceeds limit",
    weekly_notif: "Weekly Report",
    weekly_notif_desc: "Send weekly report by email",
    about: "About",
    about_desc: "Green Factory Dashboard — comprehensive sustainability monitoring platform for industrial facilities. Real-time energy, water, carbon emissions, transport, and food resource management.",
    page_support: "Contact & Support",
    support_sub: "Write to us, get support",
    contact_info: "Contact Information",
    contact_email: "Email",
    contact_phone: "Phone",
    ticket_form: "Support Ticket",
    ticket_name: "Full Name",
    ticket_subject: "Subject",
    ticket_message: "Message",
    ticket_urgency: "Urgency",
    urgency_low: "Low",
    urgency_medium: "Medium",
    urgency_high: "High",
    ticket_send: "Send",
    ticket_sending: "Sending...",
    ticket_sent: "✅ Your message has been sent!",
    ticket_history: "Submitted Tickets",
    ticket_empty: "No tickets submitted yet.",
    pw_weak: "Weak",
    pw_medium: "Medium",
    pw_strong: "Strong",
    pw_very_strong: "Very Strong",
    alert_energy: "Energy consumption has reached critical level",
    alert_security: "→ Security",
    feat_energy: "Real-time Energy Monitoring",
    feat_water: "Water Usage Analysis",
    feat_co2: "CO₂ Emissions Tracking",
    feat_security: "Cyber-Security Audit",
    headline1: "Smarter.",
    headline2: "Greener.",
    headline3: "Stronger.",
    hero_sub: "Monitor your industrial facility's energy, water and carbon indicators in real time. Manage renewable energy, transport and food waste.",
  },
  "🇹🇷 Türkçe": {
    lang_label: "Dil / Language / Dil",
    signin: "Giriş Yap",
    signup: "Kayıt Ol",
    welcome: "Hoş geldiniz!",
    welcome_sub: "Sisteme erişmek için bilgilerinizi girin",
    register_title: "Hesap Oluştur",
    register_sub: "Green Factory platformuna katılın",
    email: "E-posta",
    password: "Şifre",
    password_min: "(min. 8 karakter)",
    confirm_pw: "Şifreyi Onayla",
    first_name: "Ad",
    last_name: "Soyad",
    placeholder_email: "adiniz@gmail.com",
    placeholder_pw: "Şifrenizi girin",
    placeholder_pw_new: "Şifre oluşturun",
    placeholder_pw_confirm: "Yeni şifreyi tekrarlayın",
    placeholder_fn: "Adınız",
    placeholder_ln: "Soyadınız",
    signin_btn: "Giriş Yap →",
    signup_btn: "Kayıt Ol →",
    checking: "Kontrol ediliyor...",
    creating: "Hesap oluşturuluyor...",
    auth_error: "Kimlik doğrulama başarısız. Lütfen tekrar deneyin.",
    err_email: "Geçerli bir e-posta adresi girin",
    err_email_exists: "Bu e-posta zaten kayıtlı",
    err_name_exists: "Bu ad zaten kullanımda",
    err_fname: "Ad zorunludur",
    err_lname: "Soyad zorunludur",
    err_pw_len: "Şifre en az 8 karakter olmalıdır",
    err_pw_match: "Şifreler eşleşmiyor",
    err_email_req: "E-posta zorunludur",
    err_pw_req: "Şifre zorunludur",
    user_not_found: "Bu e-posta ile kullanıcı bulunamadı",
    wrong_pw: "Şifre yanlış. Tekrar deneyin",
    section_main: "Ana",
    section_panels: "Paneller",
    section_analytics: "Analitik",
    section_system: "Sistem",
    nav_overview: "Genel Bakış",
    nav_energy: "Enerji Tüketimi",
    nav_water: "Su Tüketimi",
    nav_emissions: "Karbon Emisyonu",
    nav_transport: "Ulaşım",
    nav_food: "Gıda Kaynakları",
    nav_map: "Fabrika Haritası",
    nav_carbon: "Karbon Hesap.",
    nav_reports: "Raporlar",
    nav_weekly: "Haftalık Raporlar",
    nav_security: "Güvenlik",
    nav_settings: "Ayarlar",
    nav_support: "İletişim & Destek",
    role_admin: "Fabrika Yöneticisi",
    role_user: "Kullanıcı",
    role_operator: "Operatör",
    logout: "Çıkış",
    live: "Canlı",
    page_overview: "Sistem Genel Bakışı",
    greeting: "Merhaba",
    all_active: "Tüm sistemler aktif",
    energy_label: "Enerji Tüketimi",
    water_label: "Su Kullanımı",
    co2_label: "Karbon Emisyonu",
    green_score: "Yeşil Puan",
    energy_trend: "Enerji Trendi",
    energy_trend_sub: "Son 20 ölçüm — her 3 saniyede güncellenir",
    water_indicator: "Su Göstergesi",
    energy_hist: "Enerji Histogramı",
    co2_trend: "CO₂ Trendi",
    water_trend: "Su Trendi",
    renewable: "Yenilenebilir Enerji",
    solar_share: "Güneş enerjisi payı",
    wind_energy: "Rüzgar Enerjisi",
    wind_share: "Rüzgar enerjisi payı",
    grid_energy: "Şebeke Enerjisi",
    grid_share: "Şebeke payı",
    sec_kpi: "Özgül Enerji Tüketimi (SEC)",
    sec_unit: "kWh/birim",
    sec_label: "1 Ürün için enerji",
    prod_count: "Üretim Adedi (bugün)",
    page_energy: "Enerji Tüketimi",
    energy_current: "kWh — Anlık",
    energy_avg: "kWh — Ortalama",
    energy_peak: "kWh — Tepe",
    energy_timeline: "Enerji Tüketimi — Zaman Çizelgesi",
    shift_analysis: "Vardiyaya Göre Enerji Analizi",
    shift_morning: "Sabah vardiyası",
    shift_afternoon: "Öğleden sonra vardiyası",
    shift_night: "Gece vardiyası",
    shift_time_m: "08:00–16:00",
    shift_time_a: "16:00–00:00",
    shift_time_n: "00:00–08:00",
    shift_avg: "Ortalama tüketim",
    page_water: "Su Tüketimi",
    water_current: "Litre — Anlık",
    water_avg: "Litre — Ortalama",
    water_peak: "Litre — Tepe",
    water_trend_title: "Su Kullanımı Trendi",
    water_level: "Anlık Doluluk Seviyesi",
    page_emissions: "Karbon Emisyonu",
    co2_current: "kg CO₂ — Anlık",
    co2_avg: "kg CO₂ — Ortalama",
    co2_total: "kg CO₂ — Toplam",
    co2_trend_title: "CO₂ Emisyon Trendi",
    page_transport: "Ulaşım Paneli",
    transport_sub: "Lojistik ve yakıt verimliliği",
    active_vehicles: "Aktif Araç",
    avg_efficiency: "Ort. Yakıt Verimliliği",
    daily_km: "Günlük km",
    vehicle_list: "Araç Listesi",
    fuel_trend: "Yakıt Trendi",
    page_food: "Gıda Paneli",
    food_sub: "Atık azaltma ve kaynak yönetimi",
    waste_target: "Atık Azaltma Hedefi",
    page_carbon: "Karbon Hesaplayıcı",
    carbon_sub: "Gerçek zamanlı CO₂ emisyon hesaplaması",
    carbon_input: "Veri Girin",
    carbon_energy: "Enerji (kWh)",
    carbon_fuel: "Yakıt (Litre)",
    carbon_food: "Gıda Atığı (kg)",
    carbon_total: "Toplam CO₂ Emisyonu",
    carbon_unit: "kg CO₂/gün",
    recommendations: "Öneriler",
    tip1: "Enerji tüketimi yüksek. Güneş panelleriyle %40 tasarruf edin.",
    tip2: "Yakıt tüketimi fazla. Elektrikli araçlara geçmeyi düşünün.",
    tip3: "Gıda atığı yüksek. Kompost sistemi kurun, %30 azaltın.",
    tip4: "Toplam emisyon kritik. 50 ağaç dikmek bu emisyonları telafi eder.",
    tip_ok: "Harika! Emisyon göstergeleriniz tatmin edici. Bu tempoyu koruyun.",
    page_reports: "Sistem Raporları",
    auto_reports: "Otomatik Raporlar",
    system_status: "Sistem Durumu",
    ready: "Hazır",
    waiting: "Bekliyor",
    normal: "Normal",
    active_status: "Aktif",
    connected: "Bağlı",
    pdf_download: "📄 PDF Raporu İndir",
    page_weekly: "Haftalık Kaynak Raporları",
    weekly_sub: "Haftalık kaynak tüketimi ve emisyon takibi",
    weekly_form_title: "Haftalık Veri Girişi",
    weekly_current_week: "Mevcut Hafta",
    weekly_energy: "Enerji (kWh)",
    weekly_water: "Su (m³)",
    weekly_gas: "Gaz (m³)",
    weekly_fuel: "Yakıt (Litre)",
    weekly_co2_auto: "Hesaplanan CO₂ Emisyonu (kg)",
    weekly_save: "Haftalık Veriyi Kaydet",
    weekly_already: "Bu haftanın verileri zaten girildi. Bir sonraki hafta tekrar aktif olacak.",
    weekly_admin_override: "Admin: Üzerine Yaz",
    weekly_saved: "✅ Veriler başarıyla kaydedildi!",
    weekly_trend: "Haftalık Kaynak Trendi",
    weekly_shift_trend: "Haftalık Vardiya Enerji Trendi",
    weekly_shift_section: "Vardiyaya Göre Enerji (kWh)",
    weekly_shift_morning: "Sabah Vardiyası (kWh)",
    weekly_shift_afternoon: "Öğleden Sonra Vardiyası (kWh)",
    weekly_shift_night: "Gece Vardiyası (kWh)",
    weekly_no_data: "Henüz veri yok. Yukarıdaki formu doldurun.",
    week_label: "Hafta",
    about_author: "GREEN PLUS",
    page_security: "Güvenlik & Uyarılar",
    security_sub: "Eşik izleme — gerçek zamanlı uyarı sistemi",
    total_alerts: "Toplam Uyarı",
    critical: "Kritik",
    warning: "Uyarı",
    today: "Bugün",
    tab_status: "🔍 Anlık Durum",
    tab_history: "📋 Uyarı Geçmişi",
    tab_config: "⚙️ Eşik Yapılandırması",
    all_normal: "Tüm sistemler normal çalışıyor",
    all_normal_sub: "Hiçbir eşik aşılmadı — sistemler kararlı",
    history_empty: "Uyarı geçmişi boş",
    history_empty_sub: "Eşik aşıldığında buraya kaydedilecek",
    active_warnings: "aktif uyarı",
    thresh_readonly: "Eşik değiştirme yetkisi yalnızca Admin hesabına aittir.",
    save_config: "💾 Eşikleri Kaydet",
    saved_ok: "✅ Kaydedildi!",
    critical_badge: "KRİTİK",
    warning_badge: "UYARI",
    page_settings: "Ayarlar & Kişiselleştirme",
    profile: "Profil",
    full_name: "Ad Soyad",
    role: "Rol",
    change_pw: "Şifreyi Değiştir",
    old_pw: "Eski Şifre",
    new_pw: "Yeni Şifre",
    confirm_new_pw: "Yeni Şifreyi Onayla",
    placeholder_old_pw: "Mevcut şifrenizi girin",
    placeholder_new_pw: "Yeni şifrenizi girin",
    placeholder_repeat_pw: "Yeni şifreyi tekrarlayın",
    pw_change_btn: "Şifreyi Değiştir →",
    pw_updating: "Güncelleniyor...",
    err_old_pw: "Eski şifre zorunludur",
    err_old_pw_wrong: "Eski şifre yanlış",
    pw_changed_ok: "Şifre başarıyla değiştirildi!",
    appearance: "Görünüm",
    theme_select: "Tema seçimi",
    theme_desc: "Uygulamanın renk şemasını seçin",
    dark: "Koyu",
    light: "Açık",
    notifications: "Bildirim Sistemi",
    energy_notif: "Enerji Limiti Uyarısı",
    energy_notif_desc: "%80 enerji limiti aşıldığında bildir",
    co2_notif: "CO₂ Emisyon Uyarısı",
    co2_notif_desc: "Emisyon kritik seviyeye ulaştığında bildir",
    water_notif: "Su Limiti Uyarısı",
    water_notif_desc: "Su tüketimi limiti aşıldığında bildir",
    weekly_notif: "Haftalık Rapor",
    weekly_notif_desc: "Her hafta e-posta ile rapor gönder",
    about: "Hakkında",
    about_desc: "Green Factory Dashboard — sanayi tesisleri için kapsamlı sürdürülebilirlik izleme platformu. Gerçek zamanlı enerji, su, karbon emisyonu, ulaşım ve gıda kaynağı yönetimi.",
    page_support: "İletişim & Destek",
    support_sub: "Bize yazın, destek alın",
    contact_info: "İletişim Bilgileri",
    contact_email: "E-posta",
    contact_phone: "Telefon",
    ticket_form: "Destek Talebi",
    ticket_name: "Ad-Soyad",
    ticket_subject: "Konu",
    ticket_message: "Mesaj",
    ticket_urgency: "Aciliyet",
    urgency_low: "Düşük",
    urgency_medium: "Orta",
    urgency_high: "Yüksek",
    ticket_send: "Gönder",
    ticket_sending: "Gönderiliyor...",
    ticket_sent: "✅ Mesajınız gönderildi!",
    ticket_history: "Gönderilen Talepler",
    ticket_empty: "Henüz gönderilmiş talep yok.",
    pw_weak: "Zayıf",
    pw_medium: "Orta",
    pw_strong: "Güçlü",
    pw_very_strong: "Çok Güçlü",
    alert_energy: "Enerji tüketimi kritik seviyeye ulaştı",
    alert_security: "→ Güvenlik",
    feat_energy: "Gerçek Zamanlı Enerji İzleme",
    feat_water: "Su Kullanımı Analizi",
    feat_co2: "CO₂ Emisyon Takibi",
    feat_security: "Siber Güvenlik Denetimi",
    headline1: "Daha Akıllı.",
    headline2: "Daha Yeşil.",
    headline3: "Daha Güçlü.",
    hero_sub: "Sanayi tesisinizdeki enerji, su ve karbon göstergelerini gerçek zamanlı izleyin. Yenilenebilir enerji, ulaşım ve gıda atıklarını yönetin.",
  },
};

type LangKey = keyof typeof LANGUAGES;
type T = (typeof LANGUAGES)["🇦🇿 Azərbaycan"];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const generateSensorData = () => ({
  energy: +(60 + Math.random() * 40).toFixed(1),
  water: +(80 + Math.random() * 120).toFixed(1),
  co2: +(6 + Math.random() * 9).toFixed(2),
  timestamp: new Date().toLocaleTimeString("az-AZ"),
});

const mockHistory = Array.from({ length: 12 }, (_, i) => ({
  time: `${String(8 + i).padStart(2, "0")}:00`,
  energy: +(45 + Math.random() * 55).toFixed(1),
  water: +(70 + Math.random() * 130).toFixed(1),
  co2: +(5 + Math.random() * 10).toFixed(2),
}));

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface User {
  name: string;
  email: string;
  isAdmin?: boolean;
}
interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}
interface AlertThreshold {
  turbineMaxLoad: number;
  turbineMinFuel: number;
  boilerMaxTemp: number;
  boilerMaxCO2: number;
  chillerMaxPower: number;
  compMaxPressure: number;
  solarMinBattery: number;
}
interface AlertEvent {
  id: string;
  timestamp: string;
  equipmentId: string;
  equipmentName: string;
  paramName: string;
  currentValue: string;
  threshold: string;
  severity: "warning" | "critical";
  telegramSent: boolean;
}
interface SensorData {
  energy: number;
  water: number;
  co2: number;
  timestamp: string;
}
interface HistoryEntry {
  time: string;
  energy: number;
  water: number;
  co2: number;
}
interface WeeklyReport {
  week_number: number;
  year: number;
  energy_kwh: number;
  water_m3: number;
  gas_m3: number;
  fuel_liters: number;
  co2_emissions: number;
  shift_morning_kwh: number;
  shift_afternoon_kwh: number;
  shift_night_kwh: number;
  saved_at: string;
}
interface SupportTicket {
  id: string;
  name: string;
  subject: string;
  message: string;
  urgency: string;
  sent_at: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
}

function loadWeeklyReports(): WeeklyReport[] {
  try { return JSON.parse(localStorage.getItem("gf_weekly_reports") || "[]"); } catch { return []; }
}
function saveWeeklyReports(reports: WeeklyReport[]) {
  try { localStorage.setItem("gf_weekly_reports", JSON.stringify(reports)); } catch {}
}
function loadSupportTickets(): SupportTicket[] {
  try { return JSON.parse(localStorage.getItem("gf_tickets") || "[]"); } catch { return []; }
}
function saveSupportTickets(tickets: SupportTicket[]) {
  try { localStorage.setItem("gf_tickets", JSON.stringify(tickets)); } catch {}
}

const DEFAULT_THRESHOLDS: AlertThreshold = {
  turbineMaxLoad: 85,
  turbineMinFuel: 15,
  boilerMaxTemp: 200,
  boilerMaxCO2: 40,
  chillerMaxPower: 38,
  compMaxPressure: 9.5,
  solarMinBattery: 50,
};

function loadThresholds(): AlertThreshold {
  try { return { ...DEFAULT_THRESHOLDS, ...JSON.parse(localStorage.getItem("gf_thresholds") || "{}") }; }
  catch { return DEFAULT_THRESHOLDS; }
}

function loadAlertHistory(): AlertEvent[] {
  try { return JSON.parse(localStorage.getItem("gf_alerts") || "[]"); }
  catch { return []; }
}

interface EquipParam { label: string; value: string; unit: string; }
interface EquipItem {
  id: string; name: string; icon: string;
  cx: number; cy: number;
  status: "normal" | "warning" | "critical";
  blinking: boolean;
  params: EquipParam[];
  history: number[];
}

function generateEquipData(): EquipItem[] {
  const fuel = +(5 + Math.random() * 93).toFixed(0);
  const boilerTemp = +(150 + Math.random() * 88).toFixed(0);
  const compHours = +(2000 + Math.random() * 6760).toFixed(0);
  const compLeak = Math.random() > 0.87;
  const battery = +(40 + Math.random() * 60).toFixed(0);
  const chillerIn = +(18 + Math.random() * 6).toFixed(1);
  return [
    {
      id: "turbine", name: "Enerji Turbini", icon: "⚡",
      cx: 140, cy: 215,
      status: +fuel < 10 ? "critical" : +fuel < 20 ? "warning" : "normal",
      blinking: +fuel < 10,
      params: [
        { label: "Gərginlik", value: String(+(380 + Math.random()*42).toFixed(0)), unit: "V" },
        { label: "Cari yük (Peak)", value: String(+(60 + Math.random()*38).toFixed(1)), unit: "kW" },
        { label: "Yanacaq səviyyəsi", value: String(fuel), unit: "%" },
        { label: "Yağ təzyiqi", value: String(+(2.0 + Math.random()*2.0).toFixed(1)), unit: "bar" },
      ],
      history: Array.from({length: 14}, () => +(60 + Math.random()*40)),
    },
    {
      id: "boiler", name: "Sənaye Qazanı", icon: "🔥",
      cx: 380, cy: 215,
      status: +boilerTemp > 215 ? "critical" : +boilerTemp > 195 ? "warning" : "normal",
      blinking: false,
      params: [
        { label: "Temperatur", value: String(boilerTemp), unit: "°C" },
        { label: "Buxar təzyiqi", value: String(+(5 + Math.random()*10).toFixed(1)), unit: "bar" },
        { label: "Su səviyyəsi", value: String(+(60 + Math.random()*36).toFixed(0)), unit: "%" },
        { label: "Carbon Footprint", value: String(+(18 + Math.random()*36).toFixed(1)), unit: "kg CO₂/h" },
      ],
      history: Array.from({length: 14}, () => +(150 + Math.random()*88)),
    },
    {
      id: "chiller", name: "Soyutma Qüləsi", icon: "❄️",
      cx: 185, cy: 385,
      status: "normal",
      blinking: false,
      params: [
        { label: "Giriş suyu", value: String(chillerIn), unit: "°C" },
        { label: "Çıxış suyu", value: String(+(+chillerIn - 5.5 - Math.random()*2).toFixed(1)), unit: "°C" },
        { label: "Fan sürəti (RPM)", value: String(+(800 + Math.random()*700).toFixed(0)), unit: "RPM" },
        { label: "Elektrik sərfiyyatı", value: String(+(20 + Math.random()*26).toFixed(1)), unit: "kW" },
      ],
      history: Array.from({length: 14}, () => +(18 + Math.random()*6)),
    },
    {
      id: "compressor", name: "Hava Kompressoru", icon: "💨",
      cx: 450, cy: 385,
      status: compLeak ? "critical" : +compHours > 7500 ? "warning" : "normal",
      blinking: compLeak,
      params: [
        { label: "Hava sızması", value: compLeak ? "Aşkarlandı!" : "Yoxdur", unit: "" },
        { label: "İşləmə saatı", value: String(compHours), unit: "h" },
        { label: "Servis qalır", value: String(Math.max(0, 8760 - +compHours)), unit: "h" },
        { label: "Sıxışdırma", value: String(+(6 + Math.random()*4).toFixed(1)), unit: "bar" },
      ],
      history: Array.from({length: 14}, () => +(6 + Math.random()*4)),
    },
    {
      id: "solar", name: "Günəş Panelləri", icon: "☀️",
      cx: 560, cy: 95,
      status: +battery < 45 ? "warning" : "normal",
      blinking: false,
      params: [
        { label: "Anlıq istehsal", value: String(+(200 + Math.random()*600).toFixed(0)), unit: "W/m²" },
        { label: "Panel təmizliyi", value: String(+(70 + Math.random()*30).toFixed(0)), unit: "%" },
        { label: "Batareya dolumu", value: String(battery), unit: "%" },
      ],
      history: Array.from({length: 14}, () => +(200 + Math.random()*600)),
    },
  ];
}

function checkAlerts(equips: EquipItem[], thresholds: AlertThreshold): Array<Omit<AlertEvent, "id"|"timestamp"|"telegramSent">> {
  const out: Array<Omit<AlertEvent, "id"|"timestamp"|"telegramSent">> = [];
  const p = (eq: EquipItem, label: string) => eq.params.find(x => x.label === label);
  for (const eq of equips) {
    if (eq.id === "turbine") {
      const load = p(eq, "Cari yük (Peak)");
      if (load && +load.value > thresholds.turbineMaxLoad)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Cari yük", currentValue: `${load.value} kW`, threshold: `≤ ${thresholds.turbineMaxLoad} kW`, severity: "critical" });
      const fuel = p(eq, "Yanacaq səviyyəsi");
      if (fuel && +fuel.value < thresholds.turbineMinFuel)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Yanacaq səviyyəsi", currentValue: `${fuel.value}%`, threshold: `≥ ${thresholds.turbineMinFuel}%`, severity: "critical" });
    }
    if (eq.id === "boiler") {
      const temp = p(eq, "Temperatur");
      if (temp && +temp.value > thresholds.boilerMaxTemp)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Temperatur", currentValue: `${temp.value} °C`, threshold: `≤ ${thresholds.boilerMaxTemp} °C`, severity: +temp.value > thresholds.boilerMaxTemp + 10 ? "critical" : "warning" });
      const co2 = p(eq, "Carbon Footprint");
      if (co2 && +co2.value > thresholds.boilerMaxCO2)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "CO₂ emissiyası", currentValue: `${co2.value} kg/h`, threshold: `≤ ${thresholds.boilerMaxCO2} kg/h`, severity: "warning" });
    }
    if (eq.id === "chiller") {
      const pwr = p(eq, "Elektrik sərfiyyatı");
      if (pwr && +pwr.value > thresholds.chillerMaxPower)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Elektrik sərfiyyatı", currentValue: `${pwr.value} kW`, threshold: `≤ ${thresholds.chillerMaxPower} kW`, severity: "warning" });
    }
    if (eq.id === "compressor") {
      const pres = p(eq, "Sıxışdırma");
      if (pres && +pres.value > thresholds.compMaxPressure)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Sıxışdırma", currentValue: `${pres.value} bar`, threshold: `≤ ${thresholds.compMaxPressure} bar`, severity: "warning" });
    }
    if (eq.id === "solar") {
      const bat = p(eq, "Batareya dolumu");
      if (bat && +bat.value < thresholds.solarMinBattery)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Batareya dolumu", currentValue: `${bat.value}%`, threshold: `≥ ${thresholds.solarMinBattery}%`, severity: "warning" });
    }
  }
  return out;
}

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconDroplets = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);
const IconWind = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    {off ? (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>)
    : (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)}
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconFactory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  </svg>
);
const IconApple = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/>
    <path d="M10 2c0 2.5 2 4 2 4s2-1.5 2-4"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6"/>
    <path d="M15.5 7.5l3 3L22 7l-3-3"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const gfStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050d0a; --bg2: #0a1a12; --bg3: #0f2318; --card: #0d1f16; --card2: #122a1c;
    --border: #1a3d28; --border2: #22503a;
    --green: #00e87a; --green2: #00c264; --green3: #00ff88;
    --teal: #00d4aa; --amber: #ffb830; --red: #ff4d6d; --blue: #4db8ff; --purple: #b48cff;
    --text: #e8f5ee; --text2: #8aab98; --text3: #4d7a61;
    --font-head: 'Inter', sans-serif; --font-body: 'DM Sans', sans-serif;
    --r: 12px; --r2: 8px;
    --shadow: 0 8px 32px rgba(0,232,122,0.08); --shadow2: 0 2px 12px rgba(0,0,0,0.4);
  }

  .gf-root.gf-light {
    --bg: #f0f7f4; --bg2: #e2efe8; --bg3: #d4e8db; --card: #ffffff; --card2: #f0f7f4;
    --border: #b8d9c6; --border2: #94c4ad; --text: #0a1f14; --text2: #2d5e42; --text3: #5a8a70;
    --shadow: 0 8px 32px rgba(0,180,90,0.10); --shadow2: 0 2px 12px rgba(0,0,0,0.10);
  }
  .gf-root.gf-light .sidebar { background: var(--bg2); }
  .gf-root.gf-light .dash-main { background: var(--bg); }
  .gf-root.gf-light .form-input { background: var(--card2); }
  .gf-root.gf-light .calc-input { background: var(--card2); }
  .gf-root.gf-light .settings-val { background: var(--card2); }
  .gf-root.gf-light .user-card { background: var(--card2); }
  .gf-root.gf-light .onboard-left { background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%); }
  .gf-root.gf-light .onboard-right { background: var(--bg); }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  .gf-root { min-height: 100vh; }

  .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .particle {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,232,122,0.6) 0%, transparent 70%);
    animation: gf-float linear infinite;
  }
  @keyframes gf-float {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; } 90% { opacity: 0.3; }
    100% { transform: translateY(-100px) scale(1); opacity: 0; }
  }

  /* LANG SELECTOR */
  .lang-selector-wrap { position: absolute; top: 20px; right: 20px; z-index: 10; }
  .lang-select {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 13px; padding: 7px 12px;
    cursor: pointer; outline: none; transition: border-color 0.2s;
  }
  .lang-select:focus { border-color: var(--green); }

  /* ONBOARDING */
  .onboard-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    position: relative; overflow: hidden;
  }
  .onboard-left {
    background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
    padding: 60px; position: relative; z-index: 1; border-right: 1px solid var(--border);
  }
  .onboard-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 56px; }
  .onboard-logo-icon {
    width: 48px; height: 48px; background: linear-gradient(135deg, var(--green), var(--teal));
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    color: var(--bg); box-shadow: 0 0 24px rgba(0,232,122,0.4);
  }
  .onboard-logo span { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--text); }
  .onboard-logo span em { color: var(--green); font-style: normal; }
  .onboard-headline {
    font-family: var(--font-head); font-size: 52px; font-weight: 800; line-height: 1.05;
    color: var(--text); margin-bottom: 24px; letter-spacing: -1.5px;
  }
  .onboard-headline span { color: var(--green); }
  .onboard-sub { font-size: 17px; color: var(--text2); line-height: 1.7; max-width: 400px; margin-bottom: 48px; font-weight: 300; }
  .feature-list { display: flex; flex-direction: column; gap: 16px; }
  .feature-item { display: flex; align-items: center; gap: 14px; }
  .feature-dot {
    width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    background: rgba(0,232,122,0.1); border: 1px solid rgba(0,232,122,0.2); color: var(--green); flex-shrink: 0;
  }
  .feature-item span { font-size: 14px; color: var(--text2); font-weight: 400; }
  .onboard-bg-circle {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,232,122,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .onboard-right {
    background: var(--bg); display: flex; flex-direction: column;
    justify-content: center; align-items: center; padding: 60px 48px;
    position: relative; z-index: 1; min-height: 100vh;
  }
  .auth-box { width: 100%; max-width: 420px; }
  .tab-switcher {
    display: flex; gap: 4px; background: var(--bg2); border-radius: 10px;
    padding: 4px; margin-bottom: 32px; border: 1px solid var(--border);
  }
  .tab-btn {
    flex: 1; padding: 10px; border: none; border-radius: 7px; cursor: pointer;
    font-family: var(--font-body); font-size: 14px; font-weight: 500; transition: all 0.2s;
    background: transparent; color: var(--text2);
  }
  .tab-btn.active { background: var(--green); color: var(--bg); font-weight: 600; }
  .auth-title { font-family: var(--font-head); font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .auth-sub { font-size: 14px; color: var(--text2); margin-bottom: 28px; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 500; color: var(--text2); margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
  .input-wrap { position: relative; }
  .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  .form-input {
    width: 100%; padding: 12px 14px 12px 42px; background: var(--card);
    border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 14px;
    transition: all 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--green); background: var(--card2); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .form-input::placeholder { color: var(--text3); }
  .form-input.err { border-color: var(--red); }
  .eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px;
  }
  .eye-btn:hover { color: var(--text2); }
  .err-msg { font-size: 11px; color: var(--red); margin-top: 4px; }
  .pw-strength { display: flex; gap: 4px; margin-top: 6px; }
  .pw-bar { height: 3px; flex: 1; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .pw-bar.weak { background: var(--red); }
  .pw-bar.medium { background: var(--amber); }
  .pw-bar.strong { background: var(--green); }
  .pw-label { font-size: 11px; color: var(--text3); margin-top: 4px; }
  .submit-btn {
    width: 100%; padding: 14px; background: linear-gradient(135deg, var(--green), var(--teal));
    border: none; border-radius: var(--r2); color: var(--bg); font-family: var(--font-head);
    font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px;
    letter-spacing: 0.3px;
  }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,232,122,0.3); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* DASHBOARD */
  .dash-layout { min-height: 100vh; display: grid; grid-template-columns: 240px 1fr; }
  .sidebar {
    background: var(--bg2); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 28px 0; position: sticky; top: 0; height: 100vh;
    overflow: hidden;
  }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 24px 32px; }
  .sidebar-logo-icon {
    width: 36px; height: 36px; background: linear-gradient(135deg, var(--green), var(--teal));
    border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--bg);
    box-shadow: 0 0 16px rgba(0,232,122,0.3);
  }
  .sidebar-logo span { font-family: var(--font-head); font-size: 16px; font-weight: 800; color: var(--text); }
  .sidebar-logo span em { color: var(--green); font-style: normal; }
  .nav-section { padding: 0 12px; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; overflow-anchor: auto; }
  .nav-section::-webkit-scrollbar { width: 3px; }
  .nav-section::-webkit-scrollbar-track { background: transparent; }
  .nav-section::-webkit-scrollbar-thumb { background: #1E5631; border-radius: 3px; }
  .nav-section::-webkit-scrollbar-thumb:hover { background: #4C9A2A; }
  .nav-label { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: 1.5px; text-transform: uppercase; padding: 0 12px; margin-bottom: 8px; margin-top: 20px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px;
    cursor: pointer; transition: all 0.15s; color: var(--text2); font-size: 14px; margin-bottom: 2px;
    border: 1px solid transparent;
  }
  .nav-item:hover { background: rgba(0,232,122,0.05); color: var(--text); }
  .nav-item.active { background: rgba(0,232,122,0.1); color: var(--green); border-color: rgba(0,232,122,0.15); }
  .nav-item .nav-icon { width: 20px; display: flex; align-items: center; justify-content: center; }
  .sidebar-bottom { padding: 0 12px; }
  .user-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r2);
    padding: 12px; display: flex; align-items: center; gap: 10px;
  }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--teal));
    display: flex; align-items: center; justify-content: center; color: var(--bg); font-family: var(--font-head);
    font-size: 14px; font-weight: 800; flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--text3); }
  .logout-btn {
    background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px;
    transition: color 0.15s;
  }
  .logout-btn:hover { color: var(--red); }

  .dash-main { background: var(--bg); padding: 32px; overflow-y: auto; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .dash-title { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: var(--text); }
  .dash-title span { color: var(--green); }
  .live-badge {
    display: flex; align-items: center; gap: 6px; padding: 6px 14px;
    background: rgba(0,232,122,0.1); border: 1px solid rgba(0,232,122,0.2); border-radius: 20px;
    font-size: 12px; color: var(--green); font-weight: 500;
  }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: gf-pulse 1.5s ease-in-out infinite; }
  @keyframes gf-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r);
    padding: 20px; position: relative; overflow: hidden; transition: border-color 0.2s, transform 0.2s;
    backdrop-filter: blur(12px);
  }
  .kpi-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .kpi-card.energy::before { background: linear-gradient(90deg, var(--amber), transparent); }
  .kpi-card.water::before { background: linear-gradient(90deg, var(--blue), transparent); }
  .kpi-card.co2::before { background: linear-gradient(90deg, var(--green), transparent); }
  .kpi-card.score::before { background: linear-gradient(90deg, var(--teal), transparent); }
  .kpi-card.transport::before { background: linear-gradient(90deg, var(--purple), transparent); }
  .kpi-card.food::before { background: linear-gradient(90deg, #4caf50, transparent); }
  .kpi-card.sec::before { background: linear-gradient(90deg, #ff9f43, transparent); }
  .kpi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .kpi-icon.energy { background: rgba(255,184,48,0.12); color: var(--amber); }
  .kpi-icon.water { background: rgba(77,184,255,0.12); color: var(--blue); }
  .kpi-icon.co2 { background: rgba(0,232,122,0.12); color: var(--green); }
  .kpi-icon.score { background: rgba(0,212,170,0.12); color: var(--teal); }
  .kpi-icon.transport { background: rgba(180,140,255,0.12); color: var(--purple); }
  .kpi-icon.food { background: rgba(76,175,80,0.12); color: #4caf50; }
  .kpi-icon.sec { background: rgba(255,159,67,0.12); color: #ff9f43; }
  .kpi-trend { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
  .kpi-trend.up { background: rgba(255,77,109,0.12); color: var(--red); }
  .kpi-trend.down { background: rgba(0,232,122,0.12); color: var(--green); }
  .kpi-value { font-family: var(--font-head); font-size: 32px; font-weight: 800; color: var(--text); line-height: 1; }
  .kpi-unit { font-size: 13px; color: var(--text2); margin-top: 4px; font-weight: 300; }
  .kpi-label { font-size: 12px; color: var(--text3); margin-top: 8px; font-weight: 400; }

  .section-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
  .section-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .section-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .panel {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 20px;
    backdrop-filter: blur(12px);
  }
  .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .panel-title { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--text); }
  .panel-sub { font-size: 12px; color: var(--text3); margin-top: 2px; }

  .mini-chart { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
  .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .bar { width: 100%; border-radius: 3px 3px 0 0; transition: height 0.5s ease; min-height: 4px; }
  .bar.energy { background: linear-gradient(180deg, var(--amber), rgba(255,184,48,0.4)); }
  .bar.water { background: linear-gradient(180deg, var(--blue), rgba(77,184,255,0.4)); }
  .bar.co2 { background: linear-gradient(180deg, var(--green), rgba(0,232,122,0.4)); }
  .bar-time { font-size: 9px; color: var(--text3); }

  .line-chart-wrap { position: relative; }
  .line-chart-wrap svg { width: 100%; height: 100%; }

  .water-container {
    width: 100%; height: 120px; border: 1px solid rgba(77,184,255,0.3);
    border-radius: 8px; overflow: hidden; background: rgba(77,184,255,0.05); position: relative;
  }
  .water-fill {
    position: absolute; bottom: 0; left: 0; right: 0; border-radius: 0 0 8px 8px;
    background: linear-gradient(180deg, rgba(77,184,255,0.7), rgba(77,184,255,0.3));
    transition: height 1s ease; display: flex; align-items: center; justify-content: center;
  }
  .water-waves {
    position: absolute; top: 0; width: 200%; height: 100%;
    background: repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px);
    animation: gf-waves 3s linear infinite;
  }
  @keyframes gf-waves { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .water-val { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: #fff; position: relative; z-index: 1; }

  .alert-banner {
    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
    background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2);
    border-radius: var(--r2); margin-bottom: 16px; animation: gf-slideIn 0.3s ease;
  }
  @keyframes gf-slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .alert-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); flex-shrink: 0; }
  .alert-text { font-size: 13px; color: var(--red); }

  .gf-page { animation: gf-fadeIn 0.3s ease; }
  @keyframes gf-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .report-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .report-item:last-child { border-bottom: none; }
  .report-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .report-title { font-size: 13px; font-weight: 500; color: var(--text); }
  .report-date { font-size: 11px; color: var(--text3); }
  .report-badge { margin-left: auto; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .rb-ok { background: rgba(0,232,122,0.1); color: var(--green); }
  .rb-warn { background: rgba(255,184,48,0.1); color: var(--amber); }
  .rb-crit { background: rgba(255,77,109,0.1); color: var(--red); }

  .calc-section { margin-bottom: 24px; }
  .calc-input-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .calc-input-group { display: flex; flex-direction: column; gap: 6px; }
  .calc-label { font-size: 12px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .calc-input {
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 15px; padding: 10px 14px;
    outline: none; transition: all 0.2s;
  }
  .calc-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .calc-result {
    background: linear-gradient(135deg, rgba(0,232,122,0.08), rgba(0,212,170,0.08));
    border: 1px solid rgba(0,232,122,0.2); border-radius: var(--r);
    padding: 24px; text-align: center; margin-bottom: 16px;
  }
  .calc-result-val { font-family: var(--font-head); font-size: 48px; font-weight: 800; color: var(--green); }
  .calc-result-unit { font-size: 16px; color: var(--text2); margin-top: 4px; }
  .calc-tips { display: flex; flex-direction: column; gap: 10px; }
  .calc-tip {
    display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px;
    background: rgba(0,232,122,0.05); border: 1px solid rgba(0,232,122,0.1); border-radius: var(--r2);
  }
  .calc-tip-icon { color: var(--green); margin-top: 1px; flex-shrink: 0; }
  .calc-tip-text { font-size: 13px; color: var(--text2); line-height: 1.5; }
  .calc-tip-text strong { color: var(--text); }

  .settings-section { margin-bottom: 28px; }
  .settings-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .settings-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; }
  .profile-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .profile-avatar {
    width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--teal));
    display: flex; align-items: center; justify-content: center; color: var(--bg);
    font-family: var(--font-head); font-size: 22px; font-weight: 800; flex-shrink: 0;
  }
  .profile-info { flex: 1; }
  .profile-name { font-family: var(--font-head); font-size: 18px; font-weight: 700; color: var(--text); }
  .profile-email { font-size: 13px; color: var(--text2); margin-top: 2px; }
  .profile-badge { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: rgba(0,232,122,0.1); color: var(--green); border: 1px solid rgba(0,232,122,0.2); }
  .settings-field { margin-bottom: 14px; }
  .settings-field label { display: block; font-size: 12px; color: var(--text2); font-weight: 500; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .settings-val { background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 10px 14px; font-size: 14px; color: var(--text); }
  .notif-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .notif-row:last-child { border-bottom: none; }
  .notif-label { font-size: 14px; color: var(--text); }
  .notif-desc { font-size: 12px; color: var(--text3); margin-top: 2px; }
  .toggle-wrap { position: relative; width: 44px; height: 24px; }
  .toggle-input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; cursor: pointer; inset: 0; background: var(--border2); border-radius: 24px; transition: all 0.2s; }
  .toggle-slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: all 0.2s; }
  .toggle-input:checked + .toggle-slider { background: var(--green); }
  .toggle-input:checked + .toggle-slider::before { transform: translateX(20px); }
  .about-version { font-family: var(--font-head); font-size: 32px; font-weight: 800; color: var(--green); margin-bottom: 8px; }
  .about-desc { font-size: 14px; color: var(--text2); line-height: 1.7; margin-bottom: 20px; }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .about-item { background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px; }
  .about-item-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .about-item-val { font-size: 14px; font-weight: 600; color: var(--text); }

  .pw-change-form { display: flex; flex-direction: column; gap: 14px; }
  .pw-input-wrap { position: relative; }
  .pw-input-wrap .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  .pw-field-input {
    width: 100%; padding: 12px 44px 12px 42px; background: var(--card2);
    border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 14px;
    transition: all 0.2s; outline: none;
  }
  .pw-field-input:focus { border-color: var(--green); background: var(--card2); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .pw-field-input::placeholder { color: var(--text3); }
  .pw-field-input.err { border-color: var(--red); }
  .pw-eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px; }
  .pw-eye-btn:hover { color: var(--text2); }
  .pw-submit-btn {
    padding: 12px 24px; background: linear-gradient(135deg, var(--green), var(--teal));
    border: none; border-radius: var(--r2); color: var(--bg); font-family: var(--font-head);
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; align-self: flex-start;
  }
  .pw-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,232,122,0.3); }
  .pw-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .theme-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
  .theme-row-label { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: var(--text); }
  .theme-row-desc { font-size: 12px; color: var(--text3); margin-top: 2px; }
  .theme-btn-group { display: flex; gap: 6px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 4px; }
  .theme-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: none; border-radius: 6px; cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 500; transition: all 0.2s; background: transparent; color: var(--text2); }
  .theme-btn.active { background: var(--card); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 1px solid var(--border); }
  .gf-root.gf-light .theme-btn.active { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

  .stats-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-mini { flex: 1; background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px; text-align: center; }
  .stat-mini-val { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--text); }
  .stat-mini-label { font-size: 11px; color: var(--text3); margin-top: 4px; }
  .fuel-bars { display: flex; flex-direction: column; gap: 10px; }
  .fuel-row { display: flex; flex-direction: column; gap: 4px; }
  .fuel-label-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text2); }
  .fuel-bar-bg { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .fuel-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .waste-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .waste-item { background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 16px; }
  .waste-icon { margin-bottom: 10px; }
  .waste-val { font-family: var(--font-head); font-size: 24px; font-weight: 800; color: var(--text); }
  .waste-label { font-size: 12px; color: var(--text3); margin-top: 4px; }

  .gf-toast {
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r);
    padding: 14px 20px; display: flex; align-items: center; gap: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: gf-slideIn 0.3s ease;
    max-width: 360px;
  }
  .gf-toast.error { border-color: rgba(255,77,109,0.4); background: rgba(255,77,109,0.08); }
  .gf-toast.success { border-color: rgba(0,232,122,0.4); background: rgba(0,232,122,0.08); }
  .gf-toast-icon { font-size: 18px; flex-shrink: 0; }
  .gf-toast-msg { font-size: 13px; color: var(--text); }

  .admin-badge { display:inline-block; background:rgba(251,191,36,0.12); color:#FBBF24; border:1px solid rgba(251,191,36,0.3); border-radius:6px; padding:2px 8px; font-size:11px; font-weight:700; margin-left:8px; vertical-align:middle; }
  .sec-crit-badge { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); color:#EF4444; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700; }
  .sec-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
  .sec-stat-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:14px 16px; text-align:center; }
  .sec-stat-card.critical { border-color:rgba(239,68,68,0.3); }
  .sec-stat-card.warning { border-color:rgba(245,158,11,0.3); }
  .sec-stat-num { font-family:var(--font-head); font-size:28px; font-weight:800; color:var(--text); line-height:1; }
  .sec-stat-lbl { font-size:11px; color:var(--text3); margin-top:4px; }
  .sec-tab-bar { margin-bottom:16px; }
  .sec-violations, .sec-hist-list { display:flex; flex-direction:column; gap:8px; }
  .sec-violation-row { display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:14px 16px; transition:border-color 0.2s; }
  .sec-violation-row.critical { border-color:rgba(239,68,68,0.35); background:rgba(239,68,68,0.04); }
  .sec-violation-row.warning { border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.03); }
  .sec-violation-icon { font-size:18px; flex-shrink:0; }
  .sec-violation-info { flex:1; min-width:0; }
  .sec-violation-equip { font-size:14px; font-weight:700; color:var(--text); font-family:var(--font-head); }
  .sec-violation-param { font-size:12px; color:var(--text3); margin-top:2px; }
  .sec-violation-vals { text-align:right; }
  .sec-violation-current { font-size:15px; font-weight:700; color:var(--text); }
  .sec-violation-thresh { font-size:11px; color:var(--text3); margin-top:2px; }
  .sec-sev-badge { font-size:10px; font-weight:800; padding:3px 7px; border-radius:5px; letter-spacing:0.5px; flex-shrink:0; }
  .sec-sev-badge.critical { background:rgba(239,68,68,0.18); color:#EF4444; }
  .sec-sev-badge.warning { background:rgba(245,158,11,0.15); color:#F59E0B; }
  .sec-hist-row { display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:12px 14px; }
  .sec-hist-row.critical { border-color:rgba(239,68,68,0.25); }
  .sec-hist-row.warning { border-color:rgba(245,158,11,0.2); }
  .sec-hist-equip { font-size:13px; font-weight:600; color:var(--text); }
  .sec-hist-meta { font-size:11px; color:var(--text3); margin-top:2px; }
  .sec-hist-val { font-size:13px; font-weight:700; color:var(--text); }
  .sec-hist-thresh { font-size:11px; color:var(--text3); }
  .sec-empty { text-align:center; padding:48px 20px; color:var(--text2); }
  .sec-empty-title { font-size:18px; font-weight:700; margin-top:12px; color:var(--text); }
  .sec-empty-sub { font-size:13px; margin-top:6px; }
  .sec-admin-notice { background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:var(--r); padding:12px 16px; font-size:13px; color:rgba(139,92,246,0.9); margin-bottom:16px; }
  .sec-thresh-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:12px; margin-bottom:20px; }
  .sec-thresh-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:16px; }
  .sec-thresh-label { font-size:13px; font-weight:600; color:var(--text); margin-bottom:10px; }
  .sec-thresh-row { display:flex; align-items:center; gap:10px; }
  .sec-slider { flex:1; accent-color:var(--green); cursor:pointer; height:4px; }
  .sec-slider:disabled { opacity:0.4; cursor:not-allowed; }
  .sec-thresh-val-box { display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .sec-num-input { width:60px; background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:4px 8px; color:var(--text); font-size:13px; font-weight:600; text-align:center; }
  .sec-num-input:disabled { opacity:0.4; cursor:not-allowed; }
  .sec-thresh-unit { font-size:12px; color:var(--text3); }
  .sec-save-btn { display:block; margin:0 auto; padding:12px 32px; background:var(--green); color:#000; font-size:14px; font-weight:700; border:none; border-radius:10px; cursor:pointer; transition:all 0.2s; }
  .sec-save-btn:hover { opacity:0.88; }
  .sec-save-btn.saved { background:#00c466; }
  @media(max-width:600px) { .sec-stats-row { grid-template-columns:repeat(2,1fr); } }

  .map-wrap { position: relative; margin-bottom: 16px; border-radius: var(--r); overflow: hidden; }
  .factory-svg { width: 100%; height: auto; display: block; border-radius: var(--r); border: 1px solid var(--border); background: rgba(5,14,9,0.85); }
  @keyframes equip-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.1;transform:scale(0.5)} }
  .equip-blink { animation: equip-blink 0.9s ease-in-out infinite; transform-origin: center; }
  .map-legend { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
  .map-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text2); }
  .map-legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .map-heat-btn {
    padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text2); cursor: pointer; font-size: 13px; font-weight: 500;
    transition: all 0.2s; white-space: nowrap;
  }
  .map-heat-btn:hover { border-color: var(--green); color: var(--green); }
  .map-heat-btn.active { background: rgba(0,232,122,0.08); border-color: var(--green); color: var(--green); }
  .map-tooltip {
    position: absolute; z-index: 50; pointer-events: none;
    background: rgba(4,12,8,0.97); border: 1px solid rgba(0,232,122,0.28);
    border-radius: 14px; padding: 14px 16px; min-width: 230px; max-width: 264px;
    backdrop-filter: blur(16px); box-shadow: 0 8px 40px rgba(0,0,0,0.55);
  }
  .map-tt-title { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .map-tt-status { font-size: 12px; font-weight: 600; margin-bottom: 10px; }
  .map-tt-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .map-tt-row:last-of-type { border-bottom: none; }
  .map-tt-row span { font-size: 12px; color: var(--text3); }
  .map-tt-row strong { font-size: 12px; color: var(--text); font-weight: 600; }
  .map-tt-crit { color: var(--red) !important; }
  .map-tt-spark { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); }
  .equip-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
  .equip-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; transition: border-color 0.2s, transform 0.2s; }
  .equip-card:hover { transform: translateY(-2px); }
  .equip-card.warning { border-color: rgba(245,158,11,0.35); }
  .equip-card.critical { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.03); }
  .equip-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .equip-card-emoji { font-size: 22px; flex-shrink: 0; line-height: 1; }
  .equip-card-name { font-family: var(--font-head); font-size: 13px; font-weight: 700; color: var(--text); }
  .equip-params { display: flex; flex-direction: column; gap: 7px; }
  .equip-param-row { display: flex; justify-content: space-between; align-items: center; }
  .equip-param-lbl { font-size: 12px; color: var(--text3); }
  .equip-param-val { font-size: 13px; font-weight: 600; color: var(--text); }
  .equip-crit-val { color: var(--red) !important; }

  /* MOBILE NAV */
  .mobile-topbar {
    display: none; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: var(--bg2); border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .mobile-topbar-brand { display: flex; align-items: center; gap: 8px; }
  .mobile-topbar-brand span { font-family: var(--font-head); font-size: 17px; font-weight: 800; color: var(--text); }
  .mobile-topbar-brand em { color: var(--green); font-style: normal; }
  .mobile-topbar-right { display: flex; align-items: center; gap: 10px; }
  .hamburger-btn {
    width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text); cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hamburger-btn:hover { border-color: var(--green); color: var(--green); }
  .mobile-avatar-sm {
    width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--teal));
    display: flex; align-items: center; justify-content: center; color: var(--bg);
    font-family: var(--font-head); font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .mobile-drawer {
    position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
    background: var(--bg2); border-right: 1px solid var(--border);
    z-index: 300; display: flex; flex-direction: column; padding: 28px 0 20px;
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto;
  }
  .mobile-drawer.open { transform: translateX(0); box-shadow: 4px 0 32px rgba(0,0,0,0.4); }
  .mobile-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.6); z-index: 299; backdrop-filter: blur(2px);
  }
  .mobile-overlay.visible { display: block; }
  .mobile-drawer-close {
    position: absolute; top: 18px; right: 16px;
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .mobile-drawer-close:hover { color: var(--text); border-color: var(--border2); }

  /* SHIFT ANALYSIS */
  .shift-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 16px; }
  .shift-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 16px;
    text-align: center;
  }
  .shift-icon { font-size: 28px; margin-bottom: 8px; }
  .shift-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .shift-time { font-size: 11px; color: var(--text3); margin-top: 2px; margin-bottom: 12px; }
  .shift-value { font-family: var(--font-head); font-size: 26px; font-weight: 800; color: var(--amber); }
  .shift-unit { font-size: 11px; color: var(--text3); }
  .shift-bar-bg { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 10px; }
  .shift-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--amber), var(--green)); }

  /* WEEKLY REPORTS */
  .weekly-form { display: flex; flex-direction: column; gap: 16px; }
  .weekly-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .weekly-field { display: flex; flex-direction: column; gap: 6px; }
  .weekly-label { font-size: 12px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .weekly-input {
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 10px 14px;
    outline: none; transition: all 0.2s;
  }
  .weekly-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .weekly-co2-result {
    background: linear-gradient(135deg, rgba(0,232,122,0.08), rgba(0,212,170,0.05));
    border: 1px solid rgba(0,232,122,0.2); border-radius: var(--r); padding: 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .weekly-co2-val { font-family: var(--font-head); font-size: 32px; font-weight: 800; color: var(--green); }
  .weekly-save-btn {
    padding: 12px 28px; background: linear-gradient(135deg, var(--green), var(--teal));
    border: none; border-radius: var(--r2); color: var(--bg); font-family: var(--font-head);
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; align-self: flex-start;
  }
  .weekly-save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,232,122,0.3); }
  .weekly-warn { background: rgba(255,184,48,0.08); border: 1px solid rgba(255,184,48,0.25); border-radius: var(--r); padding: 12px 16px; font-size: 13px; color: var(--amber); }
  .weekly-override-btn {
    margin-top: 8px; padding: 8px 16px; background: rgba(255,184,48,0.12); border: 1px solid rgba(255,184,48,0.3);
    border-radius: var(--r2); color: var(--amber); font-size: 12px; font-weight: 600; cursor: pointer;
  }
  .weekly-trend-chart { height: 180px; }
  .weekly-report-row {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 8px;
  }
  .weekly-report-week { font-family: var(--font-head); font-size: 13px; font-weight: 700; color: var(--green); flex-shrink: 0; min-width: 70px; }
  .weekly-report-vals { display: flex; gap: 16px; flex: 1; flex-wrap: wrap; }
  .weekly-report-val { font-size: 12px; color: var(--text2); }
  .weekly-report-val strong { color: var(--text); font-size: 13px; }

  /* SUPPORT */
  .support-contact-card {
    background: linear-gradient(135deg, rgba(0,232,122,0.06), rgba(0,212,170,0.04));
    border: 1px solid rgba(0,232,122,0.2); border-radius: var(--r); padding: 20px; margin-bottom: 24px;
  }
  .support-contact-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .support-contact-row + .support-contact-row { border-top: 1px solid var(--border); }
  .support-contact-icon { color: var(--green); flex-shrink: 0; }
  .support-contact-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; }
  .support-contact-val { font-size: 14px; color: var(--text); font-weight: 500; margin-top: 2px; }
  .support-form { display: flex; flex-direction: column; gap: 14px; }
  .support-field { display: flex; flex-direction: column; gap: 6px; }
  .support-label { font-size: 12px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .support-input, .support-textarea, .support-select {
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 10px 14px;
    outline: none; transition: all 0.2s;
  }
  .support-input:focus, .support-textarea:focus, .support-select:focus {
    border-color: var(--green); box-shadow: 0 0 0 3px rgba(0,232,122,0.1);
  }
  .support-textarea { resize: vertical; min-height: 100px; }
  .support-send-btn {
    display: flex; align-items: center; gap: 8px; padding: 12px 24px;
    background: linear-gradient(135deg, var(--green), var(--teal));
    border: none; border-radius: var(--r2); color: var(--bg); font-family: var(--font-head);
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; align-self: flex-start;
  }
  .support-send-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,232,122,0.3); }
  .support-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .ticket-row {
    display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px;
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 8px;
  }
  .ticket-urgency-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
  .urg-low { background: rgba(0,232,122,0.1); color: var(--green); }
  .urg-medium { background: rgba(255,184,48,0.1); color: var(--amber); }
  .urg-high { background: rgba(255,77,109,0.1); color: var(--red); }
  .ticket-subject { font-size: 13px; font-weight: 600; color: var(--text); }
  .ticket-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .ticket-msg { font-size: 12px; color: var(--text2); margin-top: 4px; }

  /* PDF button */
  .pdf-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
    background: rgba(0,232,122,0.1); border: 1px solid rgba(0,232,122,0.3);
    border-radius: var(--r2); color: var(--green); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; text-decoration: none;
  }
  .pdf-btn:hover { background: rgba(0,232,122,0.2); }

  @media (max-width: 1100px) {
    .onboard-wrap { grid-template-columns: 1fr; }
    .onboard-left { display: none; }
    .onboard-right { padding: 40px 32px; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .section-grid { grid-template-columns: 1fr; }
    .section-grid-3 { grid-template-columns: 1fr; }
    .section-grid-2 { grid-template-columns: 1fr; }
    .calc-input-row { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; }
    .shift-grid { grid-template-columns: 1fr; }
    .weekly-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .dash-layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .mobile-topbar { display: flex !important; }
    .dash-main { padding: 0; }
    .gf-page { padding: 16px 16px 24px; }
    .dash-header { margin-bottom: 16px; }
    .dash-title { font-size: 20px; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
    .kpi-value { font-size: 26px; }
    .kpi-card { padding: 14px; }
    .panel { padding: 16px; }
    .form-row { grid-template-columns: 1fr; }
    .onboard-right { padding: 28px 20px; }
    .auth-title { font-size: 22px; }
    .waste-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 420px) {
    .kpi-grid { grid-template-columns: 1fr; }
    .kpi-value { font-size: 24px; }
    .onboard-right { padding: 24px 16px; }
    .tab-switcher { margin-bottom: 20px; }
  }
`;

// ─── CHART COMPONENTS ────────────────────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 28;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - ((v - min) / range) * (H - 2) + 1 }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width: 80, height: 28, flexShrink: 0, display: "block"}}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LineChartSVG({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 400, H = 140, PAD = 10;
  const pts = data.map((v, i) => ({ x: PAD + (i / (data.length - 1)) * (W - 2 * PAD), y: H - PAD - ((v - min) / range) * (H - 2 * PAD) }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;
  const safeColor = color.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id={`grad-${safeColor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${safeColor})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="var(--bg)" strokeWidth="2"/>
      ))}
    </svg>
  );
}

function WeeklyTrendChart({ reports, t }: { reports: WeeklyReport[]; t: T }) {
  const [activeView, setActiveView] = useState<"resources"|"shifts">("resources");
  if (reports.length < 2) return null;
  const sorted = [...reports].sort((a, b) => a.week_number === b.week_number ? a.year - b.year : a.week_number - b.week_number);
  const W = 400, H = 150, PAD = 14;
  const mkPath = (vals: number[], max: number) => {
    if (vals.length < 2) return "";
    const pts = vals.map((v, i) => ({
      x: PAD + (i / (vals.length - 1)) * (W - 2 * PAD),
      y: H - PAD - ((v || 0) / max) * (H - 2 * PAD),
    }));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  };
  const mkArea = (vals: number[], max: number) => {
    if (vals.length < 2) return "";
    const pts = vals.map((v, i) => ({ x: PAD + (i / (vals.length - 1)) * (W - 2 * PAD), y: H - PAD - ((v || 0) / max) * (H - 2 * PAD) }));
    return `${pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")} L ${pts[pts.length-1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
  };
  const labels = sorted.map(r => `${t.week_label} ${r.week_number}`);
  const labelStep = Math.max(1, Math.ceil(labels.length / 6));
  // Resources view
  const maxE = Math.max(...sorted.map(r => r.energy_kwh || 0), 1);
  const maxW = Math.max(...sorted.map(r => r.water_m3 || 0), 1);
  const energyPath = mkPath(sorted.map(r => r.energy_kwh || 0), maxE);
  const waterPath = mkPath(sorted.map(r => r.water_m3 || 0), maxW);
  const energyArea = mkArea(sorted.map(r => r.energy_kwh || 0), maxE);
  // Shifts view
  const allShifts = sorted.flatMap(r => [r.shift_morning_kwh || 0, r.shift_afternoon_kwh || 0, r.shift_night_kwh || 0]);
  const maxS = Math.max(...allShifts, 1);
  const mornPath = mkPath(sorted.map(r => r.shift_morning_kwh || 0), maxS);
  const aftPath = mkPath(sorted.map(r => r.shift_afternoon_kwh || 0), maxS);
  const nightPath = mkPath(sorted.map(r => r.shift_night_kwh || 0), maxS);

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {([["resources", t.weekly_trend],["shifts", t.weekly_shift_trend]] as const).map(([v, lbl]) => (
          <button key={v} onClick={() => setActiveView(v)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid",fontSize:12,fontWeight:600,cursor:"pointer",
            borderColor: activeView === v ? "var(--green)" : "var(--border)",
            background: activeView === v ? "rgba(0,232,122,0.1)" : "var(--card)",
            color: activeView === v ? "var(--green)" : "var(--text2)"}}>
            {lbl}
          </button>
        ))}
      </div>

      {activeView === "resources" ? (
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%",height:160,display:"block"}}>
            <defs>
              <linearGradient id="wk-eg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="var(--amber)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25,0.5,0.75,1].map(f => (
              <line key={f} x1={PAD} y1={PAD + (1-f)*(H-2*PAD)} x2={W-PAD} y2={PAD + (1-f)*(H-2*PAD)} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            ))}
            <path d={energyArea} fill="url(#wk-eg)"/>
            <path d={energyPath} fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={waterPath} fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3"/>
            {/* X-axis labels */}
            {sorted.map((r, i) => i % labelStep === 0 && (
              <text key={i} x={PAD + (i / (sorted.length - 1)) * (W - 2*PAD)} y={H - 1} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">{`W${r.week_number}`}</text>
            ))}
          </svg>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8,fontSize:12,color:"var(--text3)",flexWrap:"wrap"}}>
            <span style={{color:"var(--amber)"}}>── {t.weekly_energy}</span>
            <span style={{color:"var(--blue)"}}>╌╌ {t.weekly_water}</span>
          </div>
        </div>
      ) : (
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%",height:160,display:"block"}}>
            {[0.25,0.5,0.75,1].map(f => (
              <line key={f} x1={PAD} y1={PAD + (1-f)*(H-2*PAD)} x2={W-PAD} y2={PAD + (1-f)*(H-2*PAD)} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            ))}
            <path d={mornPath} fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={aftPath} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={nightPath} fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {sorted.map((r, i) => i % labelStep === 0 && (
              <text key={i} x={PAD + (i / (sorted.length - 1)) * (W - 2*PAD)} y={H - 1} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">{`W${r.week_number}`}</text>
            ))}
          </svg>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8,fontSize:12,color:"var(--text3)",flexWrap:"wrap"}}>
            <span style={{color:"var(--amber)"}}>── {t.shift_morning}</span>
            <span style={{color:"var(--green)"}}>── {t.shift_afternoon}</span>
            <span style={{color:"var(--purple)"}}>── {t.shift_night}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "error"|"success"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`gf-toast ${type}`}>
      <span className="gf-toast-icon">{type === "error" ? "⚠️" : "✅"}</span>
      <span className="gf-toast-msg">{msg}</span>
    </div>
  );
}

// ─── PASSWORD STRENGTH ───────────────────────────────────────────────────────
function PasswordStrength({ password, t }: { password: string; t: T }) {
  const s = getPasswordStrength(password);
  const labels = ["", t.pw_weak, t.pw_medium, t.pw_strong, t.pw_very_strong];
  const cls = s <= 1 ? "weak" : s <= 2 ? "medium" : "strong";
  if (!password) return null;
  return (
    <div>
      <div className="pw-strength">
        {[1,2,3,4].map(i => <div key={i} className={`pw-bar ${i <= s ? cls : ""}`} />)}
      </div>
      <div className="pw-label">{labels[s]}</div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, lang, setLang }: { onLogin: (u: User) => void; lang: LangKey; setLang: (l: LangKey) => void }) {
  const t = LANGUAGES[lang];
  const [tab, setTab] = useState<"signin"|"signup">("signin");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"error"|"success"}|null>(null);
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });

  const getUsers = (): StoredUser[] => {
    try { return JSON.parse(localStorage.getItem("gf_users") || "[]"); } catch { return []; }
  };

  const isGmailDomain = (email: string) => email.toLowerCase().endsWith("@gmail.com");

  const validateSignUp = () => {
    const e: Record<string, string> = {};
    if (!signUp.firstName.trim()) e.firstName = t.err_fname;
    if (!signUp.lastName.trim()) e.lastName = t.err_lname;
    if (!signUp.email.includes("@")) e.email = t.err_email;
    if (signUp.password.length < 8) e.password = t.err_pw_len;
    if (signUp.password !== signUp.confirm) e.confirm = t.err_pw_match;
    if (!e.email && !isGmailDomain(signUp.email)) { e.email = t.auth_error; }
    const users = getUsers();
    if (!e.email && users.some((u: any) => u.email === signUp.email)) e.email = t.err_email_exists;
    const fullName = `${signUp.firstName} ${signUp.lastName}`.toLowerCase();
    if (users.some((u: any) => (u.firstName + " " + u.lastName).toLowerCase() === fullName)) e.firstName = t.err_name_exists;
    return e;
  };

  const handleSignUp = () => {
    const e = validateSignUp();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        setLoading(false);
        const users = getUsers();
        const isAdmin = signUp.email.toLowerCase() === "mirakbarrzayev@gmail.com";
        const newUser: StoredUser = { firstName: signUp.firstName, lastName: signUp.lastName, email: signUp.email, password: signUp.password, isAdmin };
        localStorage.setItem("gf_users", JSON.stringify([...users, newUser]));
        onLogin({ name: `${signUp.firstName} ${signUp.lastName}`, email: signUp.email, isAdmin });
      } catch { setLoading(false); }
    }, 1200);
  };

  const handleSignIn = () => {
    const e: Record<string, string> = {};
    if (!signIn.email) e.email = t.err_email_req;
    if (!signIn.password) e.password = t.err_pw_req;
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!isGmailDomain(signIn.email)) {
      setToast({ msg: t.auth_error, type: "error" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      try {
        setLoading(false);
        const users = getUsers();
        const found = users.find((u: any) => u.email === signIn.email);
        if (!found) { setToast({ msg: t.user_not_found, type: "error" }); return; }
        if (found.password !== signIn.password) { setToast({ msg: t.wrong_pw, type: "error" }); return; }
        const isAdmin = signIn.email.toLowerCase() === "mirakbarrzayev@gmail.com" || !!(found as StoredUser).isAdmin;
        onLogin({ name: `${(found as StoredUser).firstName} ${(found as StoredUser).lastName}`, email: (found as StoredUser).email, isAdmin });
      } catch { setLoading(false); }
    }, 1000);
  };

  const upd = (field: string, val: string) => { setSignUp(p => ({...p, [field]: val})); setErrors(p => ({...p, [field]: ""})); };
  const updIn = (field: string, val: string) => { setSignIn(p => ({...p, [field]: val})); setErrors(p => ({...p, [field]: ""})); };

  return (
    <div className="onboard-wrap">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {/* Language Selector */}
      <div className="lang-selector-wrap">
        <select className="lang-select" value={lang} onChange={e => setLang(e.target.value as LangKey)}>
          {(Object.keys(LANGUAGES) as LangKey[]).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="onboard-left">
        <div className="onboard-bg-circle" style={{width:500,height:500,top:-100,right:-100}}/>
        <div className="onboard-bg-circle" style={{width:300,height:300,bottom:-50,left:-50}}/>
        <div className="onboard-logo">
          <div className="onboard-logo-icon"><IconLeaf/></div>
          <span>Green<em>Factory</em></span>
        </div>
        <h1 className="onboard-headline">
          {t.headline1}<br/><span>{t.headline2}</span><br/>{t.headline3}
        </h1>
        <p className="onboard-sub">{t.hero_sub}</p>
        <div className="feature-list">
          {[[<IconZap/>, t.feat_energy],[<IconDroplets/>, t.feat_water],[<IconWind/>, t.feat_co2],[<IconShield/>, t.feat_security]].map(([icon, label], i) => (
            <div className="feature-item" key={i}>
              <div className="feature-dot">{icon}</div>
              <span>{label as string}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="onboard-right">
        <div className="auth-box">
          <div className="tab-switcher">
            <button data-testid="tab-signin" className={`tab-btn ${tab === "signin" ? "active" : ""}`} onClick={() => { setTab("signin"); setErrors({}); }}>{t.signin}</button>
            <button data-testid="tab-signup" className={`tab-btn ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setErrors({}); }}>{t.signup}</button>
          </div>

          {tab === "signin" ? (
            <div className="gf-page">
              <h2 className="auth-title">{t.welcome}</h2>
              <p className="auth-sub">{t.welcome_sub}</p>
              <div className="form-group">
                <label className="form-label">{t.email}</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconMail/></span>
                  <input data-testid="input-email" className={`form-input ${errors.email ? "err" : ""}`} type="email" placeholder={t.placeholder_email} value={signIn.email} onChange={e => updIn("email", e.target.value)}/>
                </div>
                {errors.email && <div className="err-msg">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t.password}</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input data-testid="input-password" className={`form-input ${errors.password ? "err" : ""}`} type={showPw ? "text" : "password"} placeholder={t.placeholder_pw} value={signIn.password} onChange={e => updIn("password", e.target.value)}/>
                  <button className="eye-btn" onClick={() => setShowPw(p => !p)}><IconEye off={showPw}/></button>
                </div>
                {errors.password && <div className="err-msg">{errors.password}</div>}
              </div>
              <button data-testid="button-signin" className="submit-btn" onClick={handleSignIn} disabled={loading}>
                {loading ? t.checking : t.signin_btn}
              </button>
            </div>
          ) : (
            <div className="gf-page">
              <h2 className="auth-title">{t.register_title}</h2>
              <p className="auth-sub">{t.register_sub}</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t.first_name}</label>
                  <div className="input-wrap">
                    <span className="input-icon"><IconUser/></span>
                    <input data-testid="input-firstname" className={`form-input ${errors.firstName?"err":""}`} placeholder={t.placeholder_fn} value={signUp.firstName} onChange={e=>upd("firstName",e.target.value)}/>
                  </div>
                  {errors.firstName && <div className="err-msg">{errors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">{t.last_name}</label>
                  <div className="input-wrap">
                    <span className="input-icon"><IconUser/></span>
                    <input data-testid="input-lastname" className={`form-input ${errors.lastName?"err":""}`} placeholder={t.placeholder_ln} value={signUp.lastName} onChange={e=>upd("lastName",e.target.value)}/>
                  </div>
                  {errors.lastName && <div className="err-msg">{errors.lastName}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t.email}</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconMail/></span>
                  <input data-testid="input-email-register" className={`form-input ${errors.email?"err":""}`} type="email" placeholder={t.placeholder_email} value={signUp.email} onChange={e=>upd("email",e.target.value)}/>
                </div>
                {errors.email && <div className="err-msg">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t.password} <span style={{color:"var(--text3)",fontWeight:300}}>{t.password_min}</span></label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input data-testid="input-password-register" className={`form-input ${errors.password?"err":""}`} type={showPw?"text":"password"} placeholder={t.placeholder_pw_new} value={signUp.password} onChange={e=>upd("password",e.target.value)}/>
                  <button className="eye-btn" onClick={()=>setShowPw(p=>!p)}><IconEye off={showPw}/></button>
                </div>
                {errors.password && <div className="err-msg">{errors.password}</div>}
                <PasswordStrength password={signUp.password} t={t}/>
              </div>
              <div className="form-group">
                <label className="form-label">{t.confirm_pw}</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input data-testid="input-confirm-password" className={`form-input ${errors.confirm?"err":""}`} type={showPw2?"text":"password"} placeholder={t.placeholder_pw_confirm} value={signUp.confirm} onChange={e=>upd("confirm",e.target.value)}/>
                  <button className="eye-btn" onClick={()=>setShowPw2(p=>!p)}><IconEye off={showPw2}/></button>
                </div>
                {errors.confirm && <div className="err-msg">{errors.confirm}</div>}
              </div>
              <button data-testid="button-signup" className="submit-btn" onClick={handleSignUp} disabled={loading}>
                {loading ? t.creating : t.signup_btn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CARBON CALCULATOR ────────────────────────────────────────────────────────
function CarbonCalculator({ sensor, t }: { sensor: SensorData; t: T }) {
  const [energy, setEnergy] = useState(sensor.energy.toString());
  const [fuel, setFuel] = useState("120");
  const [food, setFood] = useState("45");
  const co2 = (parseFloat(energy||"0") * 0.233) + (parseFloat(fuel||"0") * 2.31) + (parseFloat(food||"0") * 0.9);
  const tips: string[] = [];
  if (parseFloat(energy) > 80) tips.push(t.tip1);
  if (parseFloat(fuel) > 100) tips.push(t.tip2);
  if (parseFloat(food) > 30) tips.push(t.tip3);
  if (co2 > 500) tips.push(t.tip4);
  if (tips.length === 0) tips.push(t.tip_ok);
  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Karbon <span>Kalkulyatoru</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{t.carbon_sub}</div>
        </div>
      </div>
      <div className="calc-section">
        <div className="panel" style={{marginBottom:16}}>
          <div className="panel-header"><div className="panel-title">{t.carbon_input}</div></div>
          <div className="calc-input-row">
            <div className="calc-input-group">
              <label className="calc-label">{t.carbon_energy}</label>
              <input data-testid="input-energy-calc" className="calc-input" type="number" value={energy} onChange={e=>setEnergy(e.target.value)} min="0"/>
            </div>
            <div className="calc-input-group">
              <label className="calc-label">{t.carbon_fuel}</label>
              <input data-testid="input-fuel-calc" className="calc-input" type="number" value={fuel} onChange={e=>setFuel(e.target.value)} min="0"/>
            </div>
            <div className="calc-input-group">
              <label className="calc-label">{t.carbon_food}</label>
              <input data-testid="input-food-calc" className="calc-input" type="number" value={food} onChange={e=>setFood(e.target.value)} min="0"/>
            </div>
          </div>
        </div>
        <div className="calc-result">
          <div style={{fontSize:13,color:"var(--text2)",marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>{t.carbon_total}</div>
          <div data-testid="text-co2-result" className="calc-result-val">{co2.toFixed(1)}</div>
          <div className="calc-result-unit">{t.carbon_unit}</div>
        </div>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">{t.recommendations}</div></div>
          <div className="calc-tips">
            {tips.map((tip, i) => (
              <div className="calc-tip" key={i}>
                <span className="calc-tip-icon"><IconLeaf/></span>
                <span className="calc-tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSPORT PAGE ───────────────────────────────────────────────────────────
function TransportPage({ history, t }: { history: HistoryEntry[]; t: T }) {
  const vehicles = [
    { name: "Yük maşını A-12", type: "Diesel", efficiency: 72, km: 340 },
    { name: "Van B-07", type: "Benzin", efficiency: 85, km: 210 },
    { name: "Elektrik Auto C-03", type: "Elektrik", efficiency: 96, km: 180 },
    { name: "Yük maşını D-18", type: "Diesel", efficiency: 61, km: 520 },
  ];
  const avgEff = (vehicles.reduce((a,b) => a + b.efficiency, 0) / vehicles.length).toFixed(0);
  const totalKm = vehicles.reduce((a,b) => a + b.km, 0);
  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">{t.page_transport.split(" ")[0]} <span>{t.page_transport.split(" ").slice(1).join(" ")}</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{t.transport_sub}</div>
        </div>
        <div className="live-badge"><div className="live-dot"/>{t.live}</div>
      </div>
      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="kpi-card transport"><div className="kpi-header"><div className="kpi-icon transport"><IconTruck/></div></div><div className="kpi-value">{vehicles.length}</div><div className="kpi-unit">{t.active_vehicles}</div></div>
        <div className="kpi-card transport"><div className="kpi-header"><div className="kpi-icon transport"><IconTruck/></div></div><div className="kpi-value">{avgEff}%</div><div className="kpi-unit">{t.avg_efficiency}</div></div>
        <div className="kpi-card transport"><div className="kpi-header"><div className="kpi-icon transport"><IconTruck/></div></div><div className="kpi-value">{totalKm}</div><div className="kpi-unit">{t.daily_km}</div></div>
      </div>
      <div className="section-grid">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">{t.vehicle_list}</div></div>
          <div className="fuel-bars">
            {vehicles.map((v, i) => (
              <div className="fuel-row" key={i}>
                <div className="fuel-label-row">
                  <span>{v.name} <span style={{color:"var(--text3)",fontSize:11}}>({v.type})</span></span>
                  <span style={{color: v.efficiency > 80 ? "var(--green)" : v.efficiency > 65 ? "var(--amber)" : "var(--red)"}}>{v.efficiency}%</span>
                </div>
                <div className="fuel-bar-bg">
                  <div className="fuel-bar-fill" style={{width:`${v.efficiency}%`,background: v.efficiency > 80 ? "var(--green)" : v.efficiency > 65 ? "var(--amber)" : "var(--red)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">{t.fuel_trend}</div></div>
          <div className="line-chart-wrap" style={{height:200}}>
            <LineChartSVG data={history.map(h => h.energy * 0.3)} color="var(--purple)"/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOD PAGE ────────────────────────────────────────────────────────────────
function FoodPage({ t }: { t: T }) {
  const wasteItems = [
    { label: "Xammal Tullantısı", val: "42 kg", color: "var(--amber)", icon: <IconApple/> },
    { label: "Yenidən İstifadə", val: "78%", color: "var(--green)", icon: <IconLeaf/> },
    { label: "Kompost", val: "18 kg", color: "var(--teal)", icon: <IconLeaf/> },
    { label: "Çöp Həcmi", val: "12 kg", color: "var(--red)", icon: <IconWind/> },
  ];
  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Qida <span>Paneli</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{t.food_sub}</div>
        </div>
      </div>
      <div className="waste-grid" style={{marginBottom:24}}>
        {wasteItems.map((item, i) => (
          <div className="waste-item" key={i}>
            <div className="waste-icon" style={{color: item.color}}>{item.icon}</div>
            <div className="waste-val" style={{color: item.color}}>{item.val}</div>
            <div className="waste-label">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">{t.waste_target}</div></div>
        <div className="fuel-bars">
          {[
            { label: "Aylıq Hədəf: 50 kg", current: 42, max: 50, color: "var(--green)" },
            { label: "Yenidən İstifadə: 85%", current: 78, max: 85, color: "var(--teal)" },
            { label: "Kompost Hədəfi: 25 kg", current: 18, max: 25, color: "var(--amber)" },
          ].map((g, i) => (
            <div className="fuel-row" key={i}>
              <div className="fuel-label-row">
                <span>{g.label}</span>
                <span style={{color: g.color}}>{Math.round((g.current/g.max)*100)}%</span>
              </div>
              <div className="fuel-bar-bg">
                <div className="fuel-bar-fill" style={{width:`${(g.current/g.max)*100}%`,background:g.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ user, theme, setTheme, t }: { user: User; theme: string; setTheme: (t: string) => void; t: T }) {
  const [notifs, setNotifs] = useState({ energyLimit: true, co2Alert: true, weeklyReport: false, waterLimit: true });
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });
  const [pwShow, setPwShow] = useState({ old: false, new1: false, new2: false });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwToast, setPwToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const roleLabel = user.isAdmin ? t.role_admin : t.role_user;

  const handlePwChange = () => {
    const e: Record<string, string> = {};
    if (!pwForm.old) e.old = t.err_old_pw;
    if (pwForm.new1.length < 8) e.new1 = t.err_pw_len;
    if (pwForm.new1 !== pwForm.new2) e.new2 = t.err_pw_match;
    if (Object.keys(e).length) { setPwErrors(e); return; }
    try {
      const users: any[] = JSON.parse(localStorage.getItem("gf_users") || "[]");
      const idx = users.findIndex(u => u.email === user.email);
      if (idx === -1 || users[idx].password !== pwForm.old) { setPwErrors({ old: t.err_old_pw_wrong }); return; }
      setPwLoading(true);
      setTimeout(() => {
        users[idx].password = pwForm.new1;
        localStorage.setItem("gf_users", JSON.stringify(users));
        setPwLoading(false);
        setPwForm({ old: "", new1: "", new2: "" });
        setPwErrors({});
        setPwToast({ msg: t.pw_changed_ok, type: "success" });
      }, 800);
    } catch { setPwErrors({ old: t.auth_error }); }
  };

  const upd = (f: keyof typeof pwForm, v: string) => { setPwForm(p => ({ ...p, [f]: v })); setPwErrors(p => ({ ...p, [f]: "" })); };

  return (
    <div className="gf-page">
      {pwToast && <Toast msg={pwToast.msg} type={pwToast.type} onClose={() => setPwToast(null)} />}
      <div className="dash-header"><div className="dash-title">{t.page_settings.split(" & ")[0]} <span>& {t.page_settings.split(" & ")[1]}</span></div></div>

      <div className="settings-section">
        <div className="settings-title"><IconUser/> {t.profile}</div>
        <div className="settings-card">
          <div className="profile-row">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
              <div className="profile-badge"><IconShield/> {roleLabel}</div>
            </div>
          </div>
          <div className="settings-field"><label>{t.full_name}</label><div data-testid="text-profile-name" className="settings-val">{user.name}</div></div>
          <div className="settings-field"><label>{t.email}</label><div data-testid="text-profile-email" className="settings-val">{user.email}</div></div>
          <div className="settings-field"><label>{t.role}</label><div className="settings-val">{roleLabel}</div></div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title"><IconKey/> {t.change_pw}</div>
        <div className="settings-card">
          <div className="pw-change-form">
            {([["old", t.old_pw, t.placeholder_old_pw], ["new1", t.new_pw, t.placeholder_new_pw], ["new2", t.confirm_new_pw, t.placeholder_repeat_pw]] as const).map(([field, label, ph]) => (
              <div key={field} className="settings-field" style={{marginBottom:0}}>
                <label>{label}</label>
                <div className="pw-input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input
                    className={`pw-field-input ${pwErrors[field] ? "err" : ""}`}
                    type={pwShow[field] ? "text" : "password"}
                    placeholder={ph}
                    value={pwForm[field]}
                    onChange={e => upd(field, e.target.value)}
                  />
                  <button className="pw-eye-btn" onClick={() => setPwShow(p => ({ ...p, [field]: !p[field] }))}><IconEye off={pwShow[field]}/></button>
                </div>
                {pwErrors[field] && <div className="err-msg">{pwErrors[field]}</div>}
                {field === "new1" && pwForm.new1 && <PasswordStrength password={pwForm.new1} t={t}/>}
              </div>
            ))}
            <button className="pw-submit-btn" onClick={handlePwChange} disabled={pwLoading}>
              {pwLoading ? t.pw_updating : t.pw_change_btn}
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title"><IconSun/> {t.appearance}</div>
        <div className="settings-card">
          <div className="theme-row">
            <div>
              <div className="theme-row-label">{t.theme_select}</div>
              <div className="theme-row-desc">{t.theme_desc}</div>
            </div>
            <div className="theme-btn-group">
              <button className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}><IconMoon/> {t.dark}</button>
              <button className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}><IconSun/> {t.light}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title"><IconBell/> {t.notifications}</div>
        <div className="settings-card">
          {[
            { key: "energyLimit", label: t.energy_notif, desc: t.energy_notif_desc },
            { key: "co2Alert", label: t.co2_notif, desc: t.co2_notif_desc },
            { key: "waterLimit", label: t.water_notif, desc: t.water_notif_desc },
            { key: "weeklyReport", label: t.weekly_notif, desc: t.weekly_notif_desc },
          ].map(item => (
            <div className="notif-row" key={item.key}>
              <div>
                <div className="notif-label">{item.label}</div>
                <div className="notif-desc">{item.desc}</div>
              </div>
              <label className="toggle-wrap">
                <input data-testid={`toggle-${item.key}`} type="checkbox" className="toggle-input" checked={notifs[item.key as keyof typeof notifs]} onChange={e => setNotifs(p => ({ ...p, [item.key]: e.target.checked }))}/>
                <span className="toggle-slider"/>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title"><IconInfo/> {t.about}</div>
        <div className="settings-card">
          <div className="about-version">v1.2</div>
          <div className="about-desc">{t.about_desc}</div>
          <div className="about-grid">
            {([["Versiya", "1.2.0"],["Lisenziya","MIT Open Source"],["Son Yeniləmə","May 2026"],["Müəllif", t.about_author],["Platform","Web (PWA hazır)"]] as [string,string][]).map(([label, val], i) => (
              <div className="about-item" key={i}><div className="about-item-label">{label}</div><div className="about-item-val">{val}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECURITY ALERTS PAGE ────────────────────────────────────────────────────
function SecurityAlerts({ isAdmin, thresholds, setThresholds, alertHistory, t }: {
  isAdmin: boolean; thresholds: AlertThreshold; setThresholds: (t: AlertThreshold) => void;
  alertHistory: AlertEvent[]; t: T;
}) {
  const [activeTab, setActiveTab] = useState<"status"|"history"|"config">("status");
  const [local, setLocal] = useState<AlertThreshold>(thresholds);
  const [saved, setSaved] = useState(false);
  const criticalCount = alertHistory.filter(a => a.severity === "critical").length;
  const warningCount = alertHistory.filter(a => a.severity === "warning").length;
  const todayStr = new Date().toLocaleDateString("az-AZ");
  const todayCount = alertHistory.filter(a => a.timestamp.startsWith(todayStr) || a.timestamp.includes(new Date().getFullYear().toString())).length;
  const liveEquips = generateEquipData();
  const violations = checkAlerts(liveEquips, thresholds);
  const thresholdRows: { label: string; key: keyof AlertThreshold; unit: string; min: number; max: number; step: number }[] = [
    { label: "Turbin — Maks. yük", key: "turbineMaxLoad", unit: "kW", min: 50, max: 100, step: 1 },
    { label: "Turbin — Min. yanacaq", key: "turbineMinFuel", unit: "%", min: 5, max: 40, step: 1 },
    { label: "Qazan — Maks. temperatur", key: "boilerMaxTemp", unit: "°C", min: 150, max: 240, step: 5 },
    { label: "Qazan — Maks. CO₂", key: "boilerMaxCO2", unit: "kg/h", min: 15, max: 60, step: 1 },
    { label: "Soyuducu — Maks. elektrik", key: "chillerMaxPower", unit: "kW", min: 20, max: 50, step: 1 },
    { label: "Kompressor — Maks. sıxışdırma", key: "compMaxPressure", unit: "bar", min: 5, max: 12, step: 0.5 },
    { label: "Günəş — Min. batareya", key: "solarMinBattery", unit: "%", min: 20, max: 70, step: 5 },
  ];
  const handleSave = () => {
    setThresholds(local);
    try { localStorage.setItem("gf_thresholds", JSON.stringify(local)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">{t.page_security.split(" & ")[0]} <span>& {t.page_security.split(" & ")[1]}</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>
            {t.security_sub}
            {isAdmin && <span className="admin-badge">👑 Admin</span>}
          </div>
        </div>
        {violations.length > 0 && (<div className="sec-crit-badge">🔴 {violations.length} {t.active_warnings}</div>)}
      </div>
      <div className="sec-stats-row">
        {[{num:alertHistory.length,lbl:t.total_alerts,cls:""},{num:criticalCount,lbl:t.critical,cls:"critical"},{num:warningCount,lbl:t.warning,cls:"warning"},{num:todayCount,lbl:t.today,cls:""}].map(s => (
          <div key={s.lbl} className={`sec-stat-card ${s.cls}`}>
            <div className="sec-stat-num" style={s.cls === "critical" ? {color:"#EF4444"} : s.cls === "warning" ? {color:"#F59E0B"} : {}}>{s.num}</div>
            <div className="sec-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="tab-bar sec-tab-bar" style={{display:"flex",gap:4,marginBottom:16}}>
        {([["status", t.tab_status],["history", t.tab_history],["config", t.tab_config]] as const).map(([tab, lbl]) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{lbl}</button>
        ))}
      </div>
      {activeTab === "status" && (
        violations.length === 0 ? (
          <div className="sec-empty">
            <div style={{fontSize:48}}>✅</div>
            <div className="sec-empty-title">{t.all_normal}</div>
            <div className="sec-empty-sub">{t.all_normal_sub}</div>
          </div>
        ) : (
          <div className="sec-violations">
            {violations.map((v, i) => (
              <div key={i} className={`sec-violation-row ${v.severity}`}>
                <div className="sec-violation-icon">{v.severity === "critical" ? "🔴" : "🟡"}</div>
                <div className="sec-violation-info">
                  <div className="sec-violation-equip">{v.equipmentName}</div>
                  <div className="sec-violation-param">{v.paramName}</div>
                </div>
                <div className="sec-violation-vals">
                  <div className="sec-violation-current">{v.currentValue}</div>
                  <div className="sec-violation-thresh">Hədd: {v.threshold}</div>
                </div>
                <div className={`sec-sev-badge ${v.severity}`}>{v.severity === "critical" ? t.critical_badge : t.warning_badge}</div>
              </div>
            ))}
          </div>
        )
      )}
      {activeTab === "history" && (
        alertHistory.length === 0 ? (
          <div className="sec-empty">
            <div style={{fontSize:48}}>📋</div>
            <div className="sec-empty-title">{t.history_empty}</div>
            <div className="sec-empty-sub">{t.history_empty_sub}</div>
          </div>
        ) : (
          <div className="sec-hist-list">
            {alertHistory.map(a => (
              <div key={a.id} className={`sec-hist-row ${a.severity}`}>
                <div style={{fontSize:16,flexShrink:0}}>{a.severity === "critical" ? "🔴" : "🟡"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="sec-hist-equip">{a.equipmentName} — {a.paramName}</div>
                  <div className="sec-hist-meta">{a.timestamp}{a.telegramSent && " · ✈️ Telegram"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div className="sec-hist-val">{a.currentValue}</div>
                  <div className="sec-hist-thresh">Hədd: {a.threshold}</div>
                </div>
                <div className={`sec-sev-badge ${a.severity}`}>{a.severity === "critical" ? t.critical_badge : t.warning_badge}</div>
              </div>
            ))}
          </div>
        )
      )}
      {activeTab === "config" && (
        <div>
          {!isAdmin && (<div className="sec-admin-notice">🔒 {t.thresh_readonly}</div>)}
          <div className="sec-thresh-grid">
            {thresholdRows.map(row => (
              <div key={row.key} className="sec-thresh-card">
                <div className="sec-thresh-label">{row.label}</div>
                <div className="sec-thresh-row">
                  <input type="range" min={row.min} max={row.max} step={row.step} value={local[row.key]} disabled={!isAdmin} className="sec-slider" onChange={e => setLocal(p => ({...p, [row.key]: +e.target.value}))}/>
                  <div className="sec-thresh-val-box">
                    <input type="number" min={row.min} max={row.max} step={row.step} value={local[row.key]} disabled={!isAdmin} className="sec-num-input" onChange={e => setLocal(p => ({...p, [row.key]: +e.target.value}))}/>
                    <span className="sec-thresh-unit">{row.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isAdmin && (
            <button className={`sec-save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
              {saved ? t.saved_ok : t.save_config}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── WEEKLY REPORTS PAGE ──────────────────────────────────────────────────────
function WeeklyReportsPage({ isAdmin, t }: { isAdmin: boolean; t: T }) {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();
  const [reports, setReports] = useState<WeeklyReport[]>(() => loadWeeklyReports());
  const [form, setForm] = useState({ energy: "", water: "", gas: "", fuel: "" });
  const [toast, setToast] = useState<{msg:string;type:"error"|"success"}|null>(null);
  const [adminOverride, setAdminOverride] = useState(false);

  const co2Calc = (
    parseFloat(form.energy || "0") * 0.233 +
    parseFloat(form.gas || "0") * 2.04 +
    parseFloat(form.fuel || "0") * 2.31
  );

  const existingEntry = reports.find(r => r.week_number === currentWeek && r.year === currentYear);

  const handleSave = () => {
    try {
      const newReport: WeeklyReport = {
        week_number: currentWeek,
        year: currentYear,
        energy_kwh: parseFloat(form.energy || "0"),
        water_m3: parseFloat(form.water || "0"),
        gas_m3: parseFloat(form.gas || "0"),
        fuel_liters: parseFloat(form.fuel || "0"),
        co2_emissions: +co2Calc.toFixed(2),
        shift_morning_kwh: existingEntry?.shift_morning_kwh || 0,
        shift_afternoon_kwh: existingEntry?.shift_afternoon_kwh || 0,
        shift_night_kwh: existingEntry?.shift_night_kwh || 0,
        saved_at: new Date().toLocaleString("az-AZ"),
      };
      const updated = existingEntry
        ? reports.map(r => r.week_number === currentWeek && r.year === currentYear ? newReport : r)
        : [...reports, newReport];
      setReports(updated);
      saveWeeklyReports(updated);
      setForm({ energy: "", water: "", gas: "", fuel: "" });
      setAdminOverride(false);
      setToast({ msg: t.weekly_saved, type: "success" });
    } catch { setToast({ msg: t.auth_error, type: "error" }); }
  };

  return (
    <div className="gf-page">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div className="dash-header">
        <div>
          <div className="dash-title">{t.nav_weekly}</div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{t.weekly_sub}</div>
        </div>
        <div className="live-badge"><IconCalendar/> {t.weekly_current_week}: {t.week_label} {currentWeek}, {currentYear}</div>
      </div>

      <div className="panel" style={{marginBottom:24}}>
        <div className="panel-header">
          <div className="panel-title">{t.weekly_form_title}</div>
          <div style={{fontSize:12,color:"var(--green)"}}>
            {t.week_label} {currentWeek}, {currentYear}
          </div>
        </div>

        {existingEntry && !adminOverride ? (
          <div>
            <div className="weekly-warn">{t.weekly_already}</div>
            {isAdmin && (
              <button className="weekly-override-btn" onClick={() => setAdminOverride(true)}>
                {t.weekly_admin_override}
              </button>
            )}
          </div>
        ) : (
          <div className="weekly-form">
            {/* Resource inputs */}
            <div className="weekly-grid">
              {([["energy", t.weekly_energy],["water", t.weekly_water],["gas", t.weekly_gas],["fuel", t.weekly_fuel]] as const).map(([field, label]) => (
                <div key={field} className="weekly-field">
                  <label className="weekly-label">{label}</label>
                  <input className="weekly-input" type="number" min="0" placeholder="0" value={form[field]} onChange={e => setForm(p => ({...p, [field]: e.target.value}))}/>
                </div>
              ))}
            </div>
            <div className="weekly-co2-result">
              <div>
                <div style={{fontSize:12,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>{t.weekly_co2_auto}</div>
                <div className="weekly-co2-val">{co2Calc.toFixed(1)} <span style={{fontSize:16,fontWeight:400,color:"var(--text2)"}}>kg CO₂</span></div>
              </div>
              <div style={{color:"var(--green)",fontSize:28}}>🌿</div>
            </div>
            <button className="weekly-save-btn" onClick={handleSave}>{t.weekly_save}</button>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">{t.weekly_trend}</div>
        </div>
        {reports.length < 1 ? (
          <div style={{textAlign:"center",padding:"32px 20px",color:"var(--text3)"}}>{t.weekly_no_data}</div>
        ) : (
          <div>
            <WeeklyTrendChart reports={reports} t={t}/>
            <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:6}}>
              {[...reports].sort((a,b) => b.year !== a.year ? b.year - a.year : b.week_number - a.week_number).map((r, i) => (
                <div key={i} className="weekly-report-row" style={{flexDirection:"column",gap:8,alignItems:"stretch"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div className="weekly-report-week">{t.week_label} {r.week_number}, {r.year}</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>{r.saved_at}</div>
                  </div>
                  <div className="weekly-report-vals">
                    <span className="weekly-report-val">⚡ <strong>{r.energy_kwh}</strong> kWh</span>
                    <span className="weekly-report-val">💧 <strong>{r.water_m3}</strong> m³</span>
                    <span className="weekly-report-val">🔥 <strong>{r.gas_m3}</strong> m³</span>
                    <span className="weekly-report-val">🌿 <strong>{r.co2_emissions}</strong> kg CO₂</span>
                  </div>
                  {(r.shift_morning_kwh || r.shift_afternoon_kwh || r.shift_night_kwh) ? (
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"rgba(251,191,36,0.12)",color:"var(--amber)"}}>🌅 {r.shift_morning_kwh} kWh</span>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"rgba(0,232,122,0.1)",color:"var(--green)"}}>☀️ {r.shift_afternoon_kwh} kWh</span>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"rgba(139,92,246,0.12)",color:"var(--purple)"}}>🌙 {r.shift_night_kwh} kWh</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUPPORT PAGE ─────────────────────────────────────────────────────────────
function SupportPage({ t }: { t: T }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadSupportTickets());
  const [form, setForm] = useState({ name: "", subject: "", message: "", urgency: "medium" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"error"|"success"}|null>(null);

  const handleSend = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) return;
    setLoading(true);
    setTimeout(() => {
      try {
        const ticket: SupportTicket = {
          id: `ticket-${Date.now()}`,
          name: form.name, subject: form.subject, message: form.message, urgency: form.urgency,
          sent_at: new Date().toLocaleString("az-AZ"),
        };
        const updated = [ticket, ...tickets];
        setTickets(updated);
        saveSupportTickets(updated);
        setForm({ name: "", subject: "", message: "", urgency: "medium" });
        setLoading(false);
        setToast({ msg: t.ticket_sent, type: "success" });
      } catch { setLoading(false); }
    }, 1000);
  };

  const urgencyClass: Record<string, string> = { low: "urg-low", medium: "urg-medium", high: "urg-high" };
  const urgencyLabel: Record<string, string> = { low: t.urgency_low, medium: t.urgency_medium, high: t.urgency_high };

  return (
    <div className="gf-page">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div className="dash-header">
        <div>
          <div className="dash-title">Əlaqə <span>& Dəstək</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{t.support_sub}</div>
        </div>
      </div>

      <div className="section-grid">
        <div>
          <div className="panel" style={{marginBottom:16}}>
            <div className="panel-header"><div className="panel-title">{t.contact_info}</div></div>
            <div className="support-contact-card">
              <div className="support-contact-row">
                <div className="support-contact-icon"><IconMail/></div>
                <div>
                  <div className="support-contact-label">{t.contact_email}</div>
                  <div className="support-contact-val">mirakbarrzayev@gmail.com</div>
                </div>
              </div>
              <div className="support-contact-row">
                <div className="support-contact-icon"><IconPhone/></div>
                <div>
                  <div className="support-contact-label">{t.contact_phone}</div>
                  <div className="support-contact-val">+994 51 588 12 50</div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><div className="panel-title">{t.ticket_form}</div></div>
            <div className="support-form">
              <div className="support-field">
                <label className="support-label">{t.ticket_name}</label>
                <input className="support-input" placeholder={t.ticket_name} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
              </div>
              <div className="support-field">
                <label className="support-label">{t.ticket_subject}</label>
                <input className="support-input" placeholder={t.ticket_subject} value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}/>
              </div>
              <div className="support-field">
                <label className="support-label">{t.ticket_urgency}</label>
                <select className="support-select" value={form.urgency} onChange={e=>setForm(p=>({...p,urgency:e.target.value}))}>
                  <option value="low">{t.urgency_low}</option>
                  <option value="medium">{t.urgency_medium}</option>
                  <option value="high">{t.urgency_high}</option>
                </select>
              </div>
              <div className="support-field">
                <label className="support-label">{t.ticket_message}</label>
                <textarea className="support-textarea" placeholder={t.ticket_message} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}/>
              </div>
              <button className="support-send-btn" onClick={handleSend} disabled={loading || !form.name.trim() || !form.subject.trim() || !form.message.trim()}>
                <IconSend/> {loading ? t.ticket_sending : t.ticket_send}
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">{t.ticket_history}</div></div>
          {tickets.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 20px",color:"var(--text3)"}}>{t.ticket_empty}</div>
          ) : (
            <div>
              {tickets.map(tick => (
                <div key={tick.id} className="ticket-row">
                  <div className={`ticket-urgency-badge ${urgencyClass[tick.urgency] || "urg-medium"}`}>{urgencyLabel[tick.urgency] || tick.urgency}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="ticket-subject">{tick.subject}</div>
                    <div className="ticket-meta">{tick.name} · {tick.sent_at}</div>
                    <div className="ticket-msg">{tick.message.slice(0,100)}{tick.message.length > 100 ? "…" : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FACTORY MAP ──────────────────────────────────────────────────────────────
function FactoryMap({ t }: { t: T }) {
  const [equips, setEquips] = useState<EquipItem[]>(generateEquipData());
  const [hovered, setHovered] = useState<EquipItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setEquips(generateEquipData()), 4000);
    return () => clearInterval(timer);
  }, []);

  const statusColor = (s: EquipItem["status"]) => s === "critical" ? "#EF4444" : s === "warning" ? "#F59E0B" : "#00E87A";

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({ x: Math.min(e.clientX - rect.left + 16, rect.width - 270), y: Math.max(e.clientY - rect.top - 20, 4) });
  };

  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Fabrik <span>Xəritəsi</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>İnteraktiv avadanlıq monitorinqi — canlı status izləmə</div>
        </div>
        <button className={`map-heat-btn ${showHeatmap ? "active" : ""}`} onClick={() => setShowHeatmap(v => !v)}>🌡️ İstilik Xəritəsi</button>
      </div>
      <div className="map-legend">
        {[["#00E87A","Normal işləmə"],["#F59E0B","Xəbərdarlıq — texniki baxış"],["#EF4444","Kritik / Yüksək sərfiyyat"]].map(([c,l]) => (
          <div key={l} className="map-legend-item"><div className="map-legend-dot" style={{background:c}}/>{l}</div>
        ))}
      </div>
      <div ref={containerRef} className="map-wrap">
        <svg viewBox="0 0 700 480" className="factory-svg" onMouseMove={handleSvgMouseMove} onMouseLeave={() => setHovered(null)}>
          <rect x="10" y="10" width="680" height="460" rx="10" fill="rgba(6,16,11,0.8)" stroke="rgba(0,232,122,0.18)" strokeWidth="1.5"/>
          <rect x="412" y="22" width="266" height="148" rx="6" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.22)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="545" y="40" textAnchor="middle" fontSize="10" fill="rgba(251,191,36,0.65)" fontFamily="system-ui" letterSpacing="1.2">GÜNƏŞ ENERJİSİ ZOLASI</text>
          <rect x="22" y="155" width="210" height="178" rx="6" fill="rgba(245,158,11,0.04)" stroke="rgba(245,158,11,0.18)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="127" y="172" textAnchor="middle" fontSize="10" fill="rgba(245,158,11,0.6)" fontFamily="system-ui" letterSpacing="1.2">ENERJİ ZOLASI</text>
          <rect x="255" y="155" width="215" height="178" rx="6" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.18)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="362" y="172" textAnchor="middle" fontSize="10" fill="rgba(239,68,68,0.6)" fontFamily="system-ui" letterSpacing="1.2">QAZANXANA</text>
          <rect x="22" y="348" width="656" height="110" rx="6" fill="rgba(0,180,219,0.04)" stroke="rgba(0,180,219,0.18)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="350" y="366" textAnchor="middle" fontSize="10" fill="rgba(0,180,219,0.6)" fontFamily="system-ui" letterSpacing="1.2">İSTEHSAL MƏRTƏBƏSİ — Resource Waste Monitoring</text>
          <line x1="185" y1="215" x2="255" y2="215" stroke="rgba(0,232,122,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="362" y1="335" x2="230" y2="358" stroke="rgba(0,180,219,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="362" y1="335" x2="410" y2="358" stroke="rgba(0,180,219,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="548" y1="122" x2="385" y2="200" stroke="rgba(251,191,36,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          {showHeatmap && (
            <g>
              <defs>
                <radialGradient id="hm0"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.38"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0"/></radialGradient>
                <radialGradient id="hm1"><stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32"/><stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/></radialGradient>
                <radialGradient id="hm2"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.28"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0"/></radialGradient>
                <radialGradient id="hm3"><stop offset="0%" stopColor="#00B4DB" stopOpacity="0.22"/><stop offset="100%" stopColor="#00B4DB" stopOpacity="0"/></radialGradient>
              </defs>
              <ellipse cx="140" cy="215" rx="115" ry="88" fill="url(#hm0)"/>
              <ellipse cx="380" cy="215" rx="108" ry="82" fill="url(#hm1)"/>
              <ellipse cx="185" cy="385" rx="80" ry="58" fill="url(#hm2)"/>
              <ellipse cx="450" cy="385" rx="72" ry="52" fill="url(#hm3)"/>
            </g>
          )}
          {equips.map(eq => {
            const sc = statusColor(eq.status);
            const isHov = hovered?.id === eq.id;
            return (
              <g key={eq.id} onMouseEnter={() => setHovered(eq)} onMouseLeave={() => setHovered(null)} style={{cursor:"pointer"}}>
                {isHov && <circle cx={eq.cx} cy={eq.cy} r="42" fill="none" stroke={sc} strokeWidth="1" strokeDasharray="4 2" opacity="0.5"/>}
                <circle cx={eq.cx} cy={eq.cy} r="36" fill={`${sc}0d`} stroke={`${sc}28`} strokeWidth="1"/>
                <circle cx={eq.cx} cy={eq.cy} r="26" fill="rgba(5,14,9,0.95)" stroke={sc} strokeWidth={isHov ? "2.5" : "2"}/>
                <circle cx={eq.cx + 19} cy={eq.cy - 19} r="6" fill={sc} className={eq.blinking ? "equip-blink" : ""}/>
                <text x={eq.cx} y={eq.cy + 7} textAnchor="middle" fontSize="19">{eq.icon}</text>
                <text x={eq.cx} y={eq.cy + 52} textAnchor="middle" fontSize="9.5" fill="rgba(230,255,240,0.78)" fontFamily="system-ui" fontWeight="600">{eq.name}</text>
              </g>
            );
          })}
        </svg>
        {hovered && (
          <div className="map-tooltip" style={{left: tooltipPos.x, top: tooltipPos.y}}>
            <div className="map-tt-title">{hovered.icon} {hovered.name}</div>
            <div className="map-tt-status" style={{color: statusColor(hovered.status)}}>
              ● {hovered.status === "critical" ? "Kritik vəziyyət" : hovered.status === "warning" ? "Texniki xəbərdarlıq" : "Normal işləmə"}
            </div>
            {hovered.params.map((p, i) => (
              <div key={i} className="map-tt-row">
                <span>{p.label}</span>
                <strong className={p.value === "Aşkarlandı!" ? "map-tt-crit" : ""}>{p.value}{p.unit ? ` ${p.unit}` : ""}</strong>
              </div>
            ))}
            <div className="map-tt-spark">
              <div style={{fontSize:10,color:"var(--text3)",marginBottom:3}}>Son trend</div>
              <MiniSparkline data={hovered.history} color={statusColor(hovered.status)}/>
            </div>
          </div>
        )}
      </div>
      <div className="equip-cards-grid">
        {equips.map(eq => (
          <div key={eq.id} className={`equip-card ${eq.status}`}>
            <div className="equip-card-head">
              <span className="equip-card-emoji">{eq.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div className="equip-card-name">{eq.name}</div>
                <div style={{fontSize:11,color:statusColor(eq.status),marginTop:2}}>
                  {eq.status === "critical" ? "🔴 Kritik" : eq.status === "warning" ? "🟡 Xəbərdarlıq" : "🟢 Normal"}
                </div>
              </div>
              <MiniSparkline data={eq.history} color={statusColor(eq.status)}/>
            </div>
            <div className="equip-params">
              {eq.params.map((p, i) => (
                <div key={i} className="equip-param-row">
                  <span className="equip-param-lbl">{p.label}</span>
                  <span className={`equip-param-val ${p.value === "Aşkarlandı!" ? "equip-crit-val" : ""}`}>{p.value}{p.unit ? ` ${p.unit}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PDF GENERATOR ────────────────────────────────────────────────────────────
function generatePDF(t: T, sensor: SensorData) {
  try {
    const html = `
      <html><head><title>Green Factory Report</title>
      <style>
        body{font-family:Arial,sans-serif;color:#0a1f14;background:#fff;padding:40px;max-width:800px;margin:0 auto}
        h1{color:#00a854;border-bottom:2px solid #00a854;padding-bottom:12px}
        h2{color:#1a5c36;margin-top:24px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}
        .card{border:1px solid #b8d9c6;border-radius:8px;padding:16px}
        .val{font-size:28px;font-weight:800;color:#00a854}
        .lbl{font-size:12px;color:#5a8a70;text-transform:uppercase;margin-top:4px}
        .footer{margin-top:40px;font-size:11px;color:#8aab98;border-top:1px solid #b8d9c6;padding-top:12px}
      </style></head>
      <body>
        <h1>🌿 Green Factory — ${t.page_reports}</h1>
        <p>${new Date().toLocaleDateString()} · ${new Date().toLocaleTimeString()}</p>
        <h2>${t.energy_label}</h2>
        <div class="grid">
          <div class="card"><div class="val">${sensor.energy} kWh</div><div class="lbl">${t.energy_label}</div></div>
          <div class="card"><div class="val">${sensor.water} L</div><div class="lbl">${t.water_label}</div></div>
          <div class="card"><div class="val">${sensor.co2} kg</div><div class="lbl">${t.co2_label}</div></div>
          <div class="card"><div class="val">82/100</div><div class="lbl">${t.green_score}</div></div>
        </div>
        <h2>${t.system_status}</h2>
        <ul>
          <li>${t.energy_label}: ${t.normal}</li>
          <li>${t.water_label}: ${t.normal}</li>
          <li>CO₂: ${t.active_status}</li>
        </ul>
        <div class="footer">Green Factory Dashboard v1.2 · mirakbarrzayev@gmail.com · +994 51 588 12 50</div>
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  } catch {}
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, theme, setTheme, lang, setLang }: {
  user: User; onLogout: () => void; theme: string; setTheme: (t: string) => void;
  lang: LangKey; setLang: (l: LangKey) => void;
}) {
  const t = LANGUAGES[lang];
  const [activePage, setActivePage] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sensor, setSensor] = useState<SensorData>(generateSensorData());
  const [history, setHistory] = useState<HistoryEntry[]>(mockHistory);
  const [thresholds, setThresholds] = useState<AlertThreshold>(() => loadThresholds());
  const [alertHistory, setAlertHistory] = useState<AlertEvent[]>(() => loadAlertHistory());
  const [activeAlerts, setActiveAlerts] = useState<AlertEvent[]>([]);
  const [prodCount] = useState(() => Math.floor(120 + Math.random() * 80));
  const sentRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const timer = setInterval(() => {
      const s = generateSensorData();
      setSensor(s);
      setHistory(prev => {
        const next = [...prev, { time: s.timestamp, energy: s.energy, water: s.water, co2: s.co2 }];
        return next.slice(-20);
      });
      const currentThresholds = loadThresholds();
      const equips = generateEquipData();
      const violations = checkAlerts(equips, currentThresholds);
      if (violations.length > 0) {
        const now = Date.now();
        const newEvents: AlertEvent[] = [];
        for (const v of violations) {
          const key = `${v.equipmentId}:${v.paramName}`;
          const lastSeen = sentRef.current.get(key) ?? 0;
          if (now - lastSeen > 30_000) {
            sentRef.current.set(key, now);
            const ev: AlertEvent = { ...v, id: `${key}-${now}`, timestamp: new Date().toLocaleString("az-AZ"), telegramSent: false };
            newEvents.push(ev);
            try {
              fetch("/api/alerts/telegram", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipmentName: v.equipmentName, paramName: v.paramName, currentValue: v.currentValue, threshold: v.threshold, severity: v.severity }),
              }).catch(() => {});
            } catch {}
          }
        }
        if (newEvents.length > 0) {
          setAlertHistory(prev => {
            const updated = [...newEvents, ...prev].slice(0, 100);
            try { localStorage.setItem("gf_alerts", JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActiveAlerts(newEvents);
          setTimeout(() => setActiveAlerts([]), 20_000);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const energyHistory = history.map(h => h.energy);
  const waterHistory = history.map(h => h.water);
  const co2History = history.map(h => h.co2);
  const highEnergy = sensor.energy > 80;
  const sec = (sensor.energy / prodCount).toFixed(3);

  const roleLabel = user.isAdmin ? t.role_admin : t.role_user;

  // Shift data (mock)
  const shifts = [
    { name: t.shift_morning, time: t.shift_time_m, icon: "🌅", avg: +(55 + Math.random()*20).toFixed(1) },
    { name: t.shift_afternoon, time: t.shift_time_a, icon: "☀️", avg: +(70 + Math.random()*25).toFixed(1) },
    { name: t.shift_night, time: t.shift_time_n, icon: "🌙", avg: +(40 + Math.random()*18).toFixed(1) },
  ];
  const maxShift = Math.max(...shifts.map(s => s.avg));

  const navItems = [
    { id: "overview", label: t.nav_overview, icon: <IconFactory/>, section: t.section_main },
    { id: "energy", label: t.nav_energy, icon: <IconZap/>, section: t.section_main },
    { id: "water", label: t.nav_water, icon: <IconDroplets/>, section: t.section_main },
    { id: "emissions", label: t.nav_emissions, icon: <IconWind/>, section: t.section_main },
    { id: "transport", label: t.nav_transport, icon: <IconTruck/>, section: t.section_panels },
    { id: "food", label: t.nav_food, icon: <IconApple/>, section: t.section_panels },
    { id: "map", label: t.nav_map, icon: <IconMap/>, section: t.section_analytics },
    { id: "carbon", label: t.nav_carbon, icon: <IconBarChart/>, section: t.section_analytics },
    { id: "reports", label: t.nav_reports, icon: <IconBarChart/>, section: t.section_analytics },
    { id: "weekly", label: t.nav_weekly, icon: <IconCalendar/>, section: t.section_analytics },
    { id: "security", label: t.nav_security, icon: <IconShield/>, section: t.section_system },
    { id: "settings", label: t.nav_settings, icon: <IconSettings/>, section: t.section_system },
    { id: "support", label: t.nav_support, icon: <IconMail/>, section: t.section_system },
  ];

  const sections = [...new Set(navItems.map(n => n.section))];

  const NavContent = () => (
    <div className="nav-section">
      {sections.map(section => (
        <div key={section}>
          <div className="nav-label">{section}</div>
          {navItems.filter(n => n.section === section).map(item => (
            <div key={item.id} data-testid={`nav-${item.id}`} className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const UserCard = () => (
    <div className="sidebar-bottom" style={{paddingBottom:8}}>
      <div style={{padding:"0 12px 8px",display:"flex",alignItems:"center",gap:8}}>
        <select className="lang-select" style={{flex:1,fontSize:12}} value={lang} onChange={e => setLang(e.target.value as LangKey)}>
          {(Object.keys(LANGUAGES) as LangKey[]).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div style={{padding:"0 12px"}}>
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div data-testid="text-username" className="user-name">{user.name}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
          <button data-testid="button-logout" className="logout-btn" onClick={onLogout} title={t.logout}><IconLogOut/></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dash-layout">
      <div className={`mobile-overlay ${mobileMenuOpen ? "visible" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}><IconX/></button>
        <div className="sidebar-logo"><div className="sidebar-logo-icon"><IconLeaf/></div><span>Green<em>Factory</em></span></div>
        <NavContent/>
        <div className="sidebar-bottom" style={{padding:"8px 12px"}}>
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info"><div className="user-name">{user.name}</div><div className="user-role">{roleLabel}</div></div>
            <button className="logout-btn" onClick={onLogout}><IconLogOut/></button>
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <div className="sidebar-logo"><div className="sidebar-logo-icon"><IconLeaf/></div><span>Green<em>Factory</em></span></div>
        <NavContent/>
        <UserCard/>
      </aside>

      <main className="dash-main">
        <div className="mobile-topbar">
          <div className="mobile-topbar-brand">
            <div className="sidebar-logo-icon" style={{width:32,height:32,borderRadius:8}}><IconLeaf/></div>
            <span>Green<em>Factory</em></span>
          </div>
          <div className="mobile-topbar-right">
            <div className="mobile-avatar-sm">{initials}</div>
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}><IconMenu/></button>
          </div>
        </div>

        {activePage === "map" && <FactoryMap t={t}/>}
        {activePage === "security" && <SecurityAlerts isAdmin={!!user.isAdmin} thresholds={thresholds} setThresholds={setThresholds} alertHistory={alertHistory} t={t}/>}
        {activePage === "transport" && <TransportPage history={history} t={t}/>}
        {activePage === "food" && <FoodPage t={t}/>}
        {activePage === "carbon" && <CarbonCalculator sensor={sensor} t={t}/>}
        {activePage === "settings" && <SettingsPage user={user} theme={theme} setTheme={setTheme} t={t}/>}
        {activePage === "weekly" && <WeeklyReportsPage isAdmin={!!user.isAdmin} t={t}/>}
        {activePage === "support" && <SupportPage t={t}/>}

        {activePage === "overview" && (
          <div className="gf-page">
            <div className="dash-header">
              <div>
                <div className="dash-title">Sistem <span>İcmalı</span></div>
                <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{t.greeting}, {user.name.split(" ")[0]} — {t.all_active}</div>
              </div>
              <div className="live-badge"><div className="live-dot"/>{t.live}</div>
            </div>

            {(activeAlerts.length > 0 || highEnergy) && (
              <div className="alert-banner" onClick={() => setActivePage("security")} style={{cursor:"pointer"}}>
                <div className="alert-dot"/>
                <div className="alert-text">
                  {activeAlerts.length > 0
                    ? `⚠️ ${activeAlerts.length} yeni xəbərdarlıq: ${activeAlerts[0].equipmentName} — ${activeAlerts[0].paramName}: ${activeAlerts[0].currentValue}`
                    : `${t.alert_energy}: ${sensor.energy} kWh`}
                </div>
                <span style={{marginLeft:"auto",fontSize:11,opacity:0.75,flexShrink:0}}>{t.alert_security}</span>
              </div>
            )}

            <div className="kpi-grid">
              <div className="kpi-card energy">
                <div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div><div className={`kpi-trend ${sensor.energy > 70 ? "up" : "down"}`}>{sensor.energy > 70 ? "↑" : "↓"} {(Math.random()*5+1).toFixed(1)}%</div></div>
                <div data-testid="text-energy-value" className="kpi-value">{sensor.energy}</div>
                <div className="kpi-unit">kWh</div>
                <div className="kpi-label">{t.energy_label}</div>
              </div>
              <div className="kpi-card water">
                <div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div><div className="kpi-trend down">↓ 2.4%</div></div>
                <div data-testid="text-water-value" className="kpi-value">{sensor.water}</div>
                <div className="kpi-unit">Litr</div>
                <div className="kpi-label">{t.water_label}</div>
              </div>
              <div className="kpi-card co2">
                <div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div><div className={`kpi-trend ${sensor.co2 > 10 ? "up" : "down"}`}>{sensor.co2 > 10 ? "↑" : "↓"} {(Math.random()*3+1).toFixed(1)}%</div></div>
                <div data-testid="text-co2-value" className="kpi-value">{sensor.co2}</div>
                <div className="kpi-unit">kg CO₂</div>
                <div className="kpi-label">{t.co2_label}</div>
              </div>
              <div className="kpi-card score">
                <div className="kpi-header"><div className="kpi-icon score"><IconLeaf/></div><div className="kpi-trend down">↑ Yaxşı</div></div>
                <div className="kpi-value">82</div>
                <div className="kpi-unit">/ 100</div>
                <div className="kpi-label">{t.green_score}</div>
              </div>
            </div>

            {/* SEC KPI */}
            <div className="section-grid-2" style={{marginBottom:24}}>
              <div className="kpi-card sec" style={{gridColumn:"span 1"}}>
                <div className="kpi-header"><div className="kpi-icon sec"><IconBarChart/></div><div className="kpi-trend down">↓ Optimal</div></div>
                <div className="kpi-value">{sec}</div>
                <div className="kpi-unit">{t.sec_unit}</div>
                <div className="kpi-label">{t.sec_label}</div>
              </div>
              <div className="kpi-card" style={{background:"var(--card)"}}>
                <div className="kpi-header"><div className="kpi-icon score"><IconFactory/></div></div>
                <div className="kpi-value">{prodCount}</div>
                <div className="kpi-unit">{t.prod_count}</div>
                <div className="kpi-label">{t.sec_kpi}</div>
              </div>
            </div>

            <div className="section-grid">
              <div className="panel">
                <div className="panel-header">
                  <div><div className="panel-title">{t.energy_trend}</div><div className="panel-sub">{t.energy_trend_sub}</div></div>
                </div>
                <div className="line-chart-wrap" style={{height:160}}><LineChartSVG data={energyHistory} color="var(--amber)"/></div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.water_indicator}</div></div>
                <div className="water-container" style={{marginBottom:12}}>
                  <div className="water-fill" style={{height:`${Math.min(100,(sensor.water/200)*100)}%`}}>
                    <div className="water-waves"/><div className="water-val">{sensor.water}L</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)"}}>
                  <span>Min: 50L</span><span>Max: 200L</span>
                </div>
              </div>
            </div>

            <div className="section-grid-3">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.energy_hist}</div></div>
                <div className="mini-chart">
                  {history.slice(-10).map((h, i) => (<div className="bar-wrap" key={i}><div className="bar energy" style={{height:`${(h.energy/100)*100}%`}}/><div className="bar-time">{h.time?.slice(0,5)||""}</div></div>))}
                </div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.co2_trend}</div></div>
                <div className="line-chart-wrap" style={{height:100}}><LineChartSVG data={co2History} color="var(--green)"/></div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.water_trend}</div></div>
                <div className="line-chart-wrap" style={{height:100}}><LineChartSVG data={waterHistory} color="var(--blue)"/></div>
              </div>
            </div>

            <div className="section-grid-3">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.renewable}</div></div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{color:"var(--amber)",marginBottom:8}}><IconSun/></div>
                  <div style={{fontFamily:"var(--font-head)",fontSize:28,fontWeight:800,color:"var(--amber)"}}>34%</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{t.solar_share}</div>
                </div>
                <div className="fuel-bar-bg" style={{marginTop:8}}><div className="fuel-bar-fill" style={{width:"34%",background:"var(--amber)"}}/></div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.wind_energy}</div></div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{color:"var(--blue)",marginBottom:8}}><IconWind/></div>
                  <div style={{fontFamily:"var(--font-head)",fontSize:28,fontWeight:800,color:"var(--blue)"}}>21%</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{t.wind_share}</div>
                </div>
                <div className="fuel-bar-bg" style={{marginTop:8}}><div className="fuel-bar-fill" style={{width:"21%",background:"var(--blue)"}}/></div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.grid_energy}</div></div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{color:"var(--text3)",marginBottom:8}}><IconZap/></div>
                  <div style={{fontFamily:"var(--font-head)",fontSize:28,fontWeight:800,color:"var(--text2)"}}>45%</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{t.grid_share}</div>
                </div>
                <div className="fuel-bar-bg" style={{marginTop:8}}><div className="fuel-bar-fill" style={{width:"45%",background:"var(--text3)"}}/></div>
              </div>
            </div>
          </div>
        )}

        {activePage === "energy" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Enerji <span>Sərfiyyatı</span></div>
              <div className="live-badge"><div className="live-dot"/>{t.live}</div>
            </div>
            {highEnergy && <div className="alert-banner"><div className="alert-dot"/><div className="alert-text">{t.alert_energy}: {sensor.energy} kWh</div></div>}
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="kpi-card energy"><div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div></div><div className="kpi-value">{sensor.energy}</div><div className="kpi-unit">{t.energy_current}</div></div>
              <div className="kpi-card energy"><div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div></div><div className="kpi-value">{(energyHistory.reduce((a,b)=>a+b,0)/energyHistory.length||0).toFixed(1)}</div><div className="kpi-unit">{t.energy_avg}</div></div>
              <div className="kpi-card energy"><div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div></div><div className="kpi-value">{Math.max(...energyHistory).toFixed(1)}</div><div className="kpi-unit">{t.energy_peak}</div></div>
            </div>
            <div className="panel" style={{marginBottom:24}}>
              <div className="panel-header"><div className="panel-title">{t.energy_timeline}</div></div>
              <div className="line-chart-wrap" style={{height:200}}><LineChartSVG data={energyHistory} color="var(--amber)"/></div>
            </div>
            {/* Live Shift Analysis */}
            <div className="panel">
              <div className="panel-header"><div className="panel-title">{t.shift_analysis}</div></div>
              <div className="shift-grid">
                {shifts.map((s, i) => (
                  <div key={i} className="shift-card">
                    <div className="shift-icon">{s.icon}</div>
                    <div className="shift-name">{s.name}</div>
                    <div className="shift-time">{s.time}</div>
                    <div className="shift-value">{s.avg}</div>
                    <div className="shift-unit">kWh</div>
                    <div className="shift-bar-bg"><div className="shift-bar-fill" style={{width:`${(s.avg/maxShift)*100}%`}}/></div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{t.shift_avg}: {s.avg} kWh</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Weekly Shift Entry + Historical Trend */}
            <EnergyShiftPanel isAdmin={!!user.isAdmin} t={t}/>
          </div>
        )}

        {activePage === "water" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Su <span>Sərfiyyatı</span></div>
              <div className="live-badge"><div className="live-dot"/>{t.live}</div>
            </div>
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="kpi-card water"><div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div></div><div className="kpi-value">{sensor.water}</div><div className="kpi-unit">{t.water_current}</div></div>
              <div className="kpi-card water"><div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div></div><div className="kpi-value">{(waterHistory.reduce((a,b)=>a+b,0)/waterHistory.length||0).toFixed(1)}</div><div className="kpi-unit">{t.water_avg}</div></div>
              <div className="kpi-card water"><div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div></div><div className="kpi-value">{Math.max(...waterHistory).toFixed(1)}</div><div className="kpi-unit">{t.water_peak}</div></div>
            </div>
            <div className="section-grid">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.water_trend_title}</div></div>
                <div className="line-chart-wrap" style={{height:200}}><LineChartSVG data={waterHistory} color="var(--blue)"/></div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.water_level}</div></div>
                <div className="water-container" style={{height:200}}>
                  <div className="water-fill" style={{height:`${Math.min(100,(sensor.water/200)*100)}%`}}>
                    <div className="water-waves"/><div className="water-val">{sensor.water}L</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "emissions" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Karbon <span>Emissiyası</span></div>
              <div className="live-badge"><div className="live-dot"/>{t.live}</div>
            </div>
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="kpi-card co2"><div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div></div><div className="kpi-value">{sensor.co2}</div><div className="kpi-unit">{t.co2_current}</div></div>
              <div className="kpi-card co2"><div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div></div><div className="kpi-value">{(co2History.reduce((a,b)=>a+b,0)/co2History.length||0).toFixed(2)}</div><div className="kpi-unit">{t.co2_avg}</div></div>
              <div className="kpi-card co2"><div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div></div><div className="kpi-value">{co2History.reduce((a,b)=>a+b,0).toFixed(1)}</div><div className="kpi-unit">{t.co2_total}</div></div>
            </div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">{t.co2_trend_title}</div></div>
              <div className="line-chart-wrap" style={{height:200}}><LineChartSVG data={co2History} color="var(--green)"/></div>
            </div>
          </div>
        )}

        {activePage === "reports" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Sistem <span>Hesabatları</span></div>
              <button className="pdf-btn" onClick={() => generatePDF(t, sensor)}>{t.pdf_download}</button>
            </div>
            <div className="section-grid">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.auto_reports}</div></div>
                {[
                  {title:"Aylıq Enerji Hesabatı",date:"May 2026",status:"rb-ok",statusTxt:t.ready,color:"var(--amber)"},
                  {title:"Su İstehlakı Analizi",date:"May 2026",status:"rb-ok",statusTxt:t.ready,color:"var(--blue)"},
                  {title:"CO₂ Emissiya Hesabatı",date:"May 2026",status:"rb-warn",statusTxt:t.waiting,color:"var(--green)"},
                  {title:"Nəqliyyat Yanacaq Hesabatı",date:"May 2026",status:"rb-warn",statusTxt:t.waiting,color:"var(--purple)"},
                  {title:"Tullantı İdarəetməsi",date:"Aprel 2026",status:"rb-ok",statusTxt:t.ready,color:"var(--teal)"},
                ].map((r,i) => (
                  <div className="report-item" key={i}>
                    <div className="report-icon" style={{background:`rgba(0,0,0,0.1)`,color:r.color}}><IconBarChart/></div>
                    <div><div className="report-title">{r.title}</div><div className="report-date">{r.date}</div></div>
                    <div className={`report-badge ${r.status}`}>{r.statusTxt}</div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">{t.system_status}</div></div>
                {[
                  {label:"Enerji Sistemi",val:t.normal,ok:true},
                  {label:"Su Sistemi",val:t.normal,ok:true},
                  {label:"CO₂ Sensorları",val:t.active_status,ok:true},
                  {label:"Nəqliyyat GPS",val:t.connected,ok:false},
                  {label:"Qida Sensorları",val:t.active_status,ok:true},
                ].map((item,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:13,color:"var(--text2)"}}>{item.label}</span>
                    <span style={{fontSize:12,fontWeight:600,color:item.ok?"var(--green)":"var(--amber)"}}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({length: 12}, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 6,
  }));
  return (
    <div className="particles">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{width: p.size, height: p.size, left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`}}/>
      ))}
    </div>
  );
}

// ─── ENERGY SHIFT PANEL ───────────────────────────────────────────────────────
function EnergyShiftPanel({ isAdmin, t }: { isAdmin: boolean; t: T }) {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();
  const [reports, setReports] = useState<WeeklyReport[]>(() => loadWeeklyReports());
  const [form, setForm] = useState({ morning: "", afternoon: "", night: "" });
  const [override, setOverride] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"error"|"success"}|null>(null);

  const existing = reports.find(r => r.week_number === currentWeek && r.year === currentYear);
  const hasShifts = !!(existing && (existing.shift_morning_kwh || existing.shift_afternoon_kwh || existing.shift_night_kwh));
  const canEnter = !hasShifts || (isAdmin && override);

  const handleShiftSave = () => {
    try {
      const morn = parseFloat(form.morning || "0");
      const aft = parseFloat(form.afternoon || "0");
      const night = parseFloat(form.night || "0");
      const base: WeeklyReport = existing || {
        week_number: currentWeek, year: currentYear,
        energy_kwh: morn + aft + night, water_m3: 0, gas_m3: 0,
        fuel_liters: 0, co2_emissions: 0,
        shift_morning_kwh: 0, shift_afternoon_kwh: 0, shift_night_kwh: 0,
        saved_at: new Date().toLocaleString("az-AZ"),
      };
      const updated_report: WeeklyReport = { ...base, shift_morning_kwh: morn, shift_afternoon_kwh: aft, shift_night_kwh: night, saved_at: new Date().toLocaleString("az-AZ") };
      const updated = existing
        ? reports.map(r => r.week_number === currentWeek && r.year === currentYear ? updated_report : r)
        : [...reports, updated_report];
      setReports(updated);
      saveWeeklyReports(updated);
      setForm({ morning: "", afternoon: "", night: "" });
      setOverride(false);
      setToast({ msg: t.weekly_saved, type: "success" });
    } catch { setToast({ msg: t.auth_error, type: "error" }); }
  };

  return (
    <div className="panel" style={{marginTop: 24}}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div className="panel-header">
        <div className="panel-title">{t.weekly_shift_section}</div>
        <div style={{fontSize:12,color:"var(--green)"}}>{t.week_label} {currentWeek}, {currentYear}</div>
      </div>

      {/* Entry form */}
      {!canEnter ? (
        <div>
          <div className="weekly-warn">{t.weekly_already}</div>
          {isAdmin && (
            <button className="weekly-override-btn" onClick={() => setOverride(true)}>{t.weekly_admin_override}</button>
          )}
          {/* Show current stored shift values */}
          {existing && (
            <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
              <span style={{fontSize:13,padding:"4px 12px",borderRadius:20,background:"rgba(251,191,36,0.12)",color:"var(--amber)"}}>🌅 {t.shift_morning}: <strong>{existing.shift_morning_kwh}</strong> kWh</span>
              <span style={{fontSize:13,padding:"4px 12px",borderRadius:20,background:"rgba(0,232,122,0.1)",color:"var(--green)"}}>☀️ {t.shift_afternoon}: <strong>{existing.shift_afternoon_kwh}</strong> kWh</span>
              <span style={{fontSize:13,padding:"4px 12px",borderRadius:20,background:"rgba(139,92,246,0.12)",color:"var(--purple)"}}>🌙 {t.shift_night}: <strong>{existing.shift_night_kwh}</strong> kWh</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {([["morning", t.weekly_shift_morning, "var(--amber)"],["afternoon", t.weekly_shift_afternoon, "var(--green)"],["night", t.weekly_shift_night, "var(--purple)"]] as const).map(([field, label, color]) => (
              <div key={field} className="weekly-field">
                <label className="weekly-label" style={{color}}>{label}</label>
                <input className="weekly-input" type="number" min="0" placeholder="0" value={form[field]} onChange={e => setForm(p => ({...p, [field]: e.target.value}))}/>
              </div>
            ))}
          </div>
          <button className="weekly-save-btn" onClick={handleShiftSave}>{t.weekly_save}</button>
        </div>
      )}

      {/* Historical shift trend chart */}
      {reports.length >= 2 && (
        <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>{t.weekly_shift_trend}</div>
          <WeeklyTrendChart reports={reports} t={t}/>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function GreenFactory() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<string>("dark");
  const [lang, setLang] = useState<LangKey>(() => {
    try { return (localStorage.getItem("gf_lang") as LangKey) || "🇦🇿 Azərbaycan"; } catch { return "🇦🇿 Azərbaycan"; }
  });

  const handleSetLang = (l: LangKey) => {
    setLang(l);
    try { localStorage.setItem("gf_lang", l); } catch {}
  };

  return (
    <>
      <style>{gfStyles}</style>
      <div className={`gf-root${theme === "light" ? " gf-light" : ""}`}>
        {!user && <Particles/>}
        {!user
          ? <AuthScreen onLogin={setUser} lang={lang} setLang={handleSetLang}/>
          : <Dashboard user={user} onLogout={() => setUser(null)} theme={theme} setTheme={setTheme} lang={lang} setLang={handleSetLang}/>
        }
      </div>
    </>
  );
}
