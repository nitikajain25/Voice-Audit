import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1 className="landing-title">Voice Audit</h1>
        <p className="landing-subtitle">Transform your commands into actions with AI-powered voice recognition</p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>

      <div className="landing-content">
        <div className="glass-card">
          <div className="card-icon">🎤</div>
          <h2>Voice Commands</h2>
          <p>Record your voice commands and let our AI understand your intent. Speak naturally and watch as your commands are executed seamlessly.</p>
        </div>

        <div className="glass-card">
          <div className="card-icon">🤖</div>
          <h2>AI-Powered</h2>
          <p>Advanced artificial intelligence processes your voice commands, understands context, and executes solutions accordingly.</p>
        </div>

        <div className="glass-card">
          <div className="card-icon">⚡</div>
          <h2>Fast & Efficient</h2>
          <p>Get instant responses and quick execution of your commands. Our system is optimized for speed and accuracy.</p>
        </div>

        <div className="glass-card">
          <div className="card-icon">🔒</div>
          <h2>Secure & Private</h2>
          <p>Your voice data is encrypted and processed securely. We prioritize your privacy and data protection.</p>
        </div>

        <div className="glass-card">
          <div className="card-icon">📱</div>
          <h2>Cross-Platform</h2>
          <p>Access your voice audit from any device. Works seamlessly across desktop, tablet, and mobile devices.</p>
        </div>

        <div className="glass-card">
          <div className="card-icon">💡</div>
          <h2>Smart Solutions</h2>
          <p>Our AI understands complex commands and provides intelligent solutions tailored to your specific needs.</p>
        </div>
      </div>

      <div className="landing-footer">
        <p>Ready to experience the future of voice interaction?</p>
        <button className="get-started-btn-footer" onClick={handleGetStarted}>
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

