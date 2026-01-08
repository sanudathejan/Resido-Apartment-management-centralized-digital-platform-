import { useState } from 'react';
import './App.css';

function App() {
  const [statusText] = useState('Prototype Phase 1 Completed. Ready for review.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact Form Handler
  const handleContact = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('Message Sent! Thank you for contacting the Resiido Team.');
      setIsSubmitting(false);
      event.target.reset();
    }, 1500);
  };

  const handleDownloadApp = () => {
    alert('Demo APK not connected yet!');
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/images/logo_no_bg.png" 
              onError={handleImageError} 
              alt="Resiido" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              RESII<span className="text-green-500">DO</span>
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition">Home</a>
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#tech" className="hover:text-blue-600 transition">Tech Stack</a>
            <a href="#team" className="hover:text-blue-600 transition">Team</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </div>

          <button 
            onClick={handleDownloadApp} 
            className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-700 transition shadow-lg transform hover:-translate-y-0.5"
          >
            Download App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-bg pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide mb-4 border border-blue-100">
              SDGP PROJECT at University of Westminster
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Apartment Living,<br/>
              <span className="gradient-text">Redefined.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              A centralized digital platform connecting residents and managers. Handle rent, parking, and complaints in one unified mobile experience.
            </p>
            
            <div id="projectStatusDisplay" className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left rounded-r shadow-sm">
              <p className="font-bold text-yellow-800 text-sm">📢 Project Update:</p>
              <p id="statusText" className="text-yellow-700 text-sm">{statusText}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#features" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-blue-200 shadow-xl">
                Explore Features
              </a>
              <a href="#contact" className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-gray-50 transition">
                Get in Touch
              </a>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center relative">
            <div className="absolute w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-4"></div>
            <img src="/images/logo_no_bg.png" alt="Resiido App" className="relative z-10 w-3/4 drop-shadow-2xl hover:scale-105 transition duration-500"/>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-400 font-bold text-sm tracking-widest mb-10">BUILT WITH MODERN TECHNOLOGIES</p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <i className="fab fa-react text-3xl text-cyan-400"></i>
              <div>
                <h3 className="font-bold text-slate-800">React Native</h3>
                <p className="text-xs text-slate-500">Frontend Mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <i className="fas fa-leaf text-3xl text-green-500"></i>
              <div>
                <h3 className="font-bold text-slate-800">Spring Boot</h3>
                <p className="text-xs text-slate-500">Backend API</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <i className="fas fa-database text-3xl text-blue-800"></i>
              <div>
                <h3 className="font-bold text-slate-800">PostgreSQL</h3>
                <p className="text-xs text-slate-500">Database</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Core Modules</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Everything a resident needs to manage their apartment life, integrated into one seamless application.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rent Management */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition group border-t-4 border-blue-500">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition">
                <i className="fas fa-credit-card"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Rent Management</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><i className="fas fa-check text-green-500 mr-2"></i>Digital Receipts</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Payment History</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Due Alerts</li>
              </ul>
            </div>

            {/* Parking System */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition group border-t-4 border-cyan-500">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition">
                <i className="fas fa-parking"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Parking System</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><i className="fas fa-check text-green-500 mr-2"></i>Visitor QR Codes</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Slot Allocation</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Real-time Status</li>
              </ul>
            </div>

            {/* Emergency SOS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition group border-t-4 border-red-500">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition">
                <i className="fas fa-user-shield"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Emergency SOS</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><i className="fas fa-check text-green-500 mr-2"></i>Auto-location Fetch</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>One-tap Alert</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Admin Notification</li>
              </ul>
            </div>

            {/* Complaints */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition group border-t-4 border-orange-500">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition">
                <i className="fas fa-wrench"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Complaints</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><i className="fas fa-check text-green-500 mr-2"></i>Photo Evidence</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Status Tracking</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Technician Assign</li>
              </ul>
            </div>

            {/* Household Services */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition group border-t-4 border-purple-500">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition">
                <i className="fas fa-broom"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Household Services</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><i className="fas fa-check text-green-500 mr-2"></i>Book Cleaners/Cooks</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Staff Availability</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Rating System</li>
              </ul>
            </div>

            {/* Events & Booking */}
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition group border-t-4 border-pink-500">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Events & Booking</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><i className="fas fa-check text-green-500 mr-2"></i>Facility Booking</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Event RSVP</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Community News</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Meet the Team</h2>
            <p className="text-slate-600 max-w-xl mx-auto">The minds behind Resiido, dedicated to redefining apartment living.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Theminda */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition text-center group">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-cyan-400 transition">
                <img src="/images/theminda.jpg" alt="theminda" className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Theminda Dulara</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-4">Project Lead</p>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Visionary leader with expertise in project management and strategic planning.</p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/theminda-dulara-404647357/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="https://github.com/WKTDulara" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition"><i className="fab fa-github text-xl"></i></a>
              </div>
            </div>

            {/* Sanuda */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition text-center group">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-cyan-400 transition">
                <img src="/images/sanuda.jpg" alt="Sanuda" className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sanuda Thejan</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-4">Lead Developer (Frontend)</p>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Crafting intuitive and responsive user interfaces with React Native.</p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/sanuda-thejan/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="https://github.com/sanudathejan" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition"><i className="fab fa-github text-xl"></i></a>
              </div>
            </div>

            {/* Subhagya */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition text-center group">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-cyan-400 transition">
                <img src="/images/subhagya.jpg" alt="Subhagya" className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Subhagya Narayana</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-4">Lead Developer (Backend)</p>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Architecting robust and scalable APIs using Spring Boot and Java.</p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/subhagya-narayana/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="https://github.com/Subhagya314" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition"><i className="fab fa-github text-xl"></i></a>
              </div>
            </div>

            {/* Sanithi */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition text-center group">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-cyan-400 transition">
                <img src="/images/sanithi.jpg" alt="Sanithi" className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sanithi Amalja</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-4">Database Administrator</p>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Ensuring data integrity, security, and performance with PostgreSQL.</p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/sanithi-amalja-b82395202/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="https://github.com/sani0309" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition"><i className="fab fa-github text-xl"></i></a>
              </div>
            </div>

            {/* Abhishek */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition text-center group">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-cyan-400 transition">
                <img src="/images/abhishek.png" alt="Abhishek" className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2"> Mukunthan Abishek</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-4">UI/UX Designer</p>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Designing user-centric experiences that are both beautiful and functional.</p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/abishek-mukunthan-148120313/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="https://www.github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition"><i className="fab fa-github text-xl"></i></a>
              </div>
            </div>

            {/* Vidupa */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition text-center group">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-cyan-400 transition">
                <img src="/images/vidupa.jpg" alt="Vidupa" className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Vidupa Senevirathna</h3>
              <p className="text-sm text-cyan-600 font-semibold mb-4">QA Engineer</p>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Dedicated to delivering a bug-free and reliable product through rigorous testing.</p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/vidupa-seneviratne-7ab959352/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="https://github.com/vidupasenevirathna29-ops" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition"><i className="fab fa-github text-xl"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Contact Us</h2>
            <p className="text-slate-600 mt-2">Have questions about the project? Reach out to the team.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-slate-800 text-white p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 pointer-events-none"></div>
              
              <div>
                <h3 className="text-xl font-bold mb-6">Get in Touch</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Resiido is a 2nd Year Software Development Group Project (SDGP). We'd love to hear your feedback on our prototype.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-university text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">University</p>
                      <p className="font-semibold">IIT / University of Westminster</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-envelope text-green-400"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="font-semibold">resiido.connect@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 relative z-10">
                <p className="text-sm text-slate-400 mb-3">Follow our progress:</p>
                <div className="flex gap-4">
                  <a href="https://www.linkedin.com/company/resido/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition cursor-pointer z-20"><i className="fab fa-linkedin-in"></i></a>
                  <a href="https://www.instagram.com/resiido.com_?igsh=MWFzeWhnbjltdjJreA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 transition cursor-pointer z-20"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>

            <div className="p-10">
              <form onSubmit={handleContact}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <input type="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                    <textarea rows="4" required placeholder="Write your message here..." className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"></textarea>
                  </div>
                  <button 
                    type="submit" 
                    id="submitBtn" 
                    className={`w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Sending...
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <i className="fas fa-paper-plane"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm">
            <p>© 2025 Resiido Team. All rights reserved.</p>
            <p>University of Westminster | IIT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
