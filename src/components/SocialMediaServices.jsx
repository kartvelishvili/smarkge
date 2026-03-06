import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Palette, MessageSquare, Users, Target, TrendingUp, BarChart, TestTube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SocialMediaServices = ({ darkMode }) => {
  const { language } = useLanguage();

  const organicServices = [
    { 
      icon: Calendar, 
      title: language === 'ka' ? 'კონტენტ კალენდარი' : 'Content Calendar', 
      description: language === 'ka' ? 'სოციალური მედია კამპანიების სტრატეგიული დაგეგმვა' : 'Strategic planning of posts across all platforms' 
    },
    { 
      icon: Palette, 
      title: language === 'ka' ? 'პოსტების დიზაინი და ბრენდინგი' : 'Post Design', 
      description: language === 'ka' ? 'თქვენს ბრენდზე მორგებული ვიზუალების შექმნა' : 'Eye-catching visuals tailored to your brand' 
    },
    { 
      icon: MessageSquare, 
      title: language === 'ka' ? 'ქოფიარაითინგი' : 'Captions & Copywriting', 
      description: language === 'ka' ? 'Facebook გვერდის მართვა და მომხმარებელთან კომუნიკაცია' : 'Engaging copy that drives interaction' 
    },
    { 
      icon: Users, 
      title: language === 'ka' ? 'კომუნიკაციის მართვა' : 'Community Management', 
      description: language === 'ka' ? 'აუდიტორიასთან ურთიერთობა და ჩართულობის ზრდა' : 'Building relationships with your audience' 
    }
  ];

  const paidServices = [
    { 
      icon: Target, 
      title: language === 'ka' ? 'სარეკლამო კამპანიები' : 'Campaign Structure', 
      description: language === 'ka' ? 'ოპტიმიზირებული რეკლამა მაქსიმალური შედეგისთვის' : 'Optimized ad campaigns for maximum ROI' 
    },
    { 
      icon: Users, 
      title: language === 'ka' ? 'მიზნობრივი აუდიტორია' : 'Target Audiences', 
      description: language === 'ka' ? 'ზუსტი თარგეთირება იდეალური მომხმარებლის მისაღწევად' : 'Precise targeting to reach ideal customers' 
    },
    { 
      icon: TestTube, 
      title: language === 'ka' ? 'A/B ტესტირება' : 'A/B Testing', 
      description: language === 'ka' ? 'საძიებო სისტემებში ოპტიმიზაცია და მუდმივი ტესტირება' : 'Continuous testing for better performance' 
    },
    { 
      icon: TrendingUp, 
      title: language === 'ka' ? 'ოპტიმიზაცია' : 'Optimization', 
      description: language === 'ka' ? 'შედეგების გაუმჯობესება რეალურ დროში' : 'Real-time adjustments for peak results' 
    },
    { 
      icon: BarChart, 
      title: language === 'ka' ? 'ანალიტიკა და რეპორტინგი' : 'Analytics Reports', 
      description: language === 'ka' ? 'დეტალური რეპორტები კამპანიის შედეგებზე' : 'Detailed insights and performance tracking' 
    }
  ];

  const platforms = [
    { name: 'Facebook', color: '#1877F2' },
    { name: 'Instagram', color: '#E4405F' },
    { name: 'TikTok', color: '#000000' },
    { name: 'LinkedIn', color: '#0A66C2' },
    { name: 'YouTube', color: '#FF0000' }
  ];

  const packages = [
    {
      name: language === 'ka' ? 'სტარტერი' : 'Starter',
      posts: language === 'ka' ? '8-12 პოსტი/თვეში' : '8-12 posts/month',
      platforms: language === 'ka' ? '2 პლატფორმა' : '2 platforms',
      features: language === 'ka' 
        ? ['კონტენტ კალენდარი', 'ბაზისური დიზაინი', 'ყოველთვიური რეპორტი'] 
        : ['Content calendar', 'Basic design', 'Monthly report'],
      price: language === 'ka' ? 'ინდივიდუალური ფასი' : 'Custom pricing'
    },
    {
      name: language === 'ka' ? 'ზრდა' : 'Growth',
      posts: language === 'ka' ? '16-20 პოსტი/თვეში' : '16-20 posts/month',
      platforms: language === 'ka' ? '3 პლატფორმა' : '3 platforms',
      features: language === 'ka' 
        ? ['კონტენტ სტრატეგია', 'პრემიუმ დიზაინი', 'რეკლამის მართვა', 'ყოველკვირეული რეპორტი'] 
        : ['Content calendar', 'Premium design', 'Paid ads management', 'Weekly reports'],
      price: language === 'ka' ? 'ინდივიდუალური ფასი' : 'Custom pricing',
      popular: true
    },
    {
      name: language === 'ka' ? 'მასშტაბირება' : 'Scale',
      posts: language === 'ka' ? '24-30 პოსტი/თვეში' : '24-30 posts/month',
      platforms: language === 'ka' ? 'ყველა პლატფორმა' : 'All platforms',
      features: language === 'ka' 
        ? ['სრული სტრატეგია', 'პრემიუმ დიზაინი', 'რთული რეკლამები', 'ყოველდღიური მონიტორინგი', 'პირადი მენეჯერი'] 
        : ['Full content strategy', 'Premium design', 'Advanced ads', 'Daily monitoring', 'Dedicated manager'],
      price: language === 'ka' ? 'ინდივიდუალური ფასი' : 'Custom pricing'
    }
  ];

  const titleText = language === 'ka' ? 'სოციალური მედია კამპანიები და რეკლამა' : 'Social Media Creative & Paid Advertising';
  const descText = language === 'ka' 
    ? 'გაზარდეთ თქვენი ბიზნესის ცნობადობა სოციალური მედია კამპანიებით. ჩვენ გთავაზობთ Facebook გვერდის მართვას და მიზნობრივ რეკლამას.' 
    : 'Build a powerful social media presence with consistent content and targeted advertising that drives measurable results.';

  const organicTitle = language === 'ka' ? 'ორგანული სოციალური მედია' : 'Organic Social Media';
  const paidTitle = language === 'ka' ? 'ფასიანი რეკლამა' : 'Paid Advertising';
  const platformsTitle = language === 'ka' ? 'პლატფორმები, რომლებსაც ვმართავთ' : 'Platforms We Specialize In';
  const packagesTitle = language === 'ka' ? 'ყოველთვიური პაკეტები' : 'Monthly Package Examples';

  return (
    <section className={`py-20 lg:py-32 ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {titleText}
          </h2>
          <p className={`text-lg lg:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {descText}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 rounded-2xl border ${
              darkMode 
                ? 'bg-gradient-to-br from-[#0A0F1C] to-[#1a1f35] border-[#5468E7]/30' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
            } shadow-xl`}
          >
            <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
              {organicTitle}
            </h3>
            <div className="space-y-4">
              {organicServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#5468E7] to-[#3A4BCF]">
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                      {service.title}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 rounded-2xl border ${
              darkMode 
                ? 'bg-gradient-to-br from-[#0A0F1C] to-[#1a1f35] border-[#5468E7]/30' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
            } shadow-xl`}
          >
            <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
              {paidTitle}
            </h3>
            <div className="space-y-4">
              {paidServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#5468E7] to-[#3A4BCF]">
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                      {service.title}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {platformsTitle}
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`px-8 py-4 rounded-xl ${
                  darkMode ? 'bg-[#0A0F1C]' : 'bg-white'
                } shadow-lg border ${
                  darkMode ? 'border-[#5468E7]/30' : 'border-gray-200'
                } hover:scale-110 transition-all`}
              >
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {platform.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-2xl lg:text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {packagesTitle}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-8 rounded-2xl border relative ${
                  pkg.popular
                    ? 'border-[#5468E7] shadow-2xl shadow-[#5468E7]/20'
                    : darkMode 
                      ? 'border-[#5468E7]/30' 
                      : 'border-gray-200'
                } ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] rounded-full text-white text-sm font-bold">
                    {language === 'ka' ? 'პოპულარული' : 'Most Popular'}
                  </div>
                )}

                <h4 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {pkg.name}
                </h4>
                
                <div className="mb-6">
                  <p className={`text-lg font-semibold ${darkMode ? 'text-[#7A88F5]' : 'text-[#3A4BCF]'}`}>
                    {pkg.posts}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {pkg.platforms}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5468E7] mt-2" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {pkg.price}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialMediaServices;