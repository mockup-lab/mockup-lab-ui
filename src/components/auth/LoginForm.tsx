import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { signInWithEmailPassword, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setFormError(null);
      
      await signInWithEmailPassword(email, password);
      onSuccess();
    } catch (error) {
      console.error('Login error:', error);
      setFormError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setFormError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setFormError(null);
      
      await resetPassword(email);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setFormError('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {formError && <div className="form-error">{formError}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      
      <button
        type="button"
        className="forgot-password-link"
        onClick={handleResetPassword}
      >
        Forgot password?
      </button>
      
      <button
        type="submit"
        className="auth-submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;