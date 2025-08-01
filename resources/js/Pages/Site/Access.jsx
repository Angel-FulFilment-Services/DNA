import React, { useState, useEffect } from 'react';
import SplashScreen from '../../Components/Site/SplashScreen';
import ModeSelector from '../../Components/Site/ModeSelector';
import QRScannerPanel from '../../Components/Site/QRScannerPanel';
import SignInTypeSelector from '../../Components/Site/SignInTypeSelector';
import DeliveryTypeSelector from '../../Components/Site/DeliveryTypeSelector';
import SignInEmployeeForm from '../../Components/Site/SignInEmployeeForm';
import SignInVisitorForm from '../../Components/Site/SignInVisitorForm';
import SignInContractorForm from '../../Components/Site/SignInContractorForm';
import UpdateProfilePhoto from '../../Components/Site/UpdateProfilePhoto';
import TermsAndConditions from '../../Components/Site/TermsAndConditions';
import SignOutList from '../../Components/Site/SignOutList';
import WelcomeMessage from '../../Components/Site/WelcomeMessage';
import GoodbyeMessage from '../../Components/Site/GoodbyeMessage';
import ThankYouMessage from '../../Components/Site/ThankYouMessage';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Access({ location }) {
  const [step, setStep] = useState('splash'); // Initial step set to terms and conditions
  const [formData, setFormData] = useState(); // Form data
  const [signInType, setSignInType] = useState(null); // Tracks the type of sign in (employee, visitor, contractor)
  const [signOutType, setSignOutType] = useState(null); // Tracks the type of sign out (employee, visitor, contractor)

  useEffect(() => {
    if(step === 'splash') {
      setSignInType(null); // Reset signInType when returning to splash
      setSignOutType(null); // Reset signOutType when returning to splash
      setFormData(null); // Reset formData when returning to splash
    }
  }, [step])

  // Example handlers
  const handleSplashContinue = () => setStep('mode');
  const handleSignInType = (type) => {
    setSignInType(type);
    setStep(`signin-${type}`);
  }
  const handleSignOutType = (type) => {
    setSignOutType(type);
    setStep('signout');
  }
  
  const signIn = async () => {
    // if (checkProfilePhoto && signInType === 'employee' && formData.userId) {
    //   try {
    //     const response = await axios.get('/onsite/has-profile-photo', {
    //       params: { user_id: formData.userId },
    //     });

    //     if (!response.data.has_photo) {
    //       setStep('update-profile-photo');
    //       return;
    //     }
    //   } catch (err) {

    //   }
    // }

    // Store a cookie with the user ID if it doesn't exists to mark employees who have agreed to terms.
    if(signInType === 'employee' && !formData.userId) {
      document.cookie = `terms_accepted=${formData.userId}; path=/; max-age=31536000;`; // 1 year
    }

    try {
      const response = await axios.get(`/onsite/sign-in`, {
        params: {  
          type: 'access',
          category: signInType,
          location: location,
          ...formData,
        },
      });

      if (response.status === 400) {
        throw new Error('This user is already signed in.');
      }

      if (!response.status === 200) {
        throw new Error('Failed to sign in user');
      }

      if (response.status === 200) {
        handleSignInComplete();
      }
    } catch (err) {
      setIsProcessing(false); // Reset processing state on error
      const audio = new Audio('/sounds/access-error.mp3');
      audio.play();
      if(err.response && err.response.status === 400) {
        toast.error("You're already signed in.", {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
        setStep('splash');
      } else {
        toast.error('Could not sign in, please try again.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
        setStep('splash');
      }
    }
  };

  const handleSignInComplete = () => setStep('welcome');
  const handleSignOutComplete = () => setStep('goodbye');

  // Render logic
  if (step === 'splash') return <SplashScreen onContinue={handleSplashContinue} setStep={setStep} />;
  if (step === 'mode') return  (
      <div className="fixed inset-0 bg-white dark:bg-dark-900 z-40 p-12 pt-10 h-screen w-screen">
        <div className="flex items-center justify-between w-full h-10">
          <img
            src="/images/angel-logo.png"
            alt="Logo"
            className="w-28 h-auto"
          />
          <XMarkIcon className="h-10 w-10 text-black dark:text-dark-100 stroke-[2.5] cursor-pointer" onClick={() => setStep('splash')} />
        </div>
        <div className="flex h-full w-full gap-x-10 pt-14 pb-16">
          <div className="w-1/2 flex justify-center items-center">
            <ModeSelector setStep={setStep} location={location} />
          </div>
          <div className="w-1/2">
            <QRScannerPanel onComplete={setFormData} setStep={setStep} location={location} />
          </div>
        </div>
      </div>
  );
  if (step === 'signin-type') return <SignInTypeSelector onSelect={handleSignInType} setStep={setStep} location={location} />;
  if (step === 'delivery-type') return <DeliveryTypeSelector setStep={setStep} location={location} from="mode" />;
  if (step === 'delivery-type-home') return <DeliveryTypeSelector setStep={setStep} location={location} from="splash" />;
  if (step === 'signout-type') return <SignInTypeSelector onSelect={handleSignOutType} setStep={setStep} location={location} />;
  if (step === 'signin-employee') return <SignInEmployeeForm onComplete={setFormData} setStep={setStep} location={location} />;
  if (step === 'signin-visitor') return <SignInVisitorForm onComplete={setFormData} setStep={setStep} location={location} />;
  if (step === 'signin-contractor') return <SignInContractorForm onComplete={setFormData} setStep={setStep} location={location} />;
  if (step === 'update-profile-photo') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-900 z-40 p-12 pt-10 h-screen w-full">
        <UpdateProfilePhoto onComplete={() => signIn(false)} userId={formData.userId} />
      </div>
    );
  }
  if (step === 'signout') return <SignOutList onComplete={handleSignOutComplete} setStep={setStep} signOutType={signOutType} />;
  if (step === 'terms-and-conditions') return <TermsAndConditions onComplete={signIn} setStep={setStep} />;
  if (step === 'welcome') return <WelcomeMessage setStep={setStep} />;
  if (step === 'goodbye') return <GoodbyeMessage setStep={setStep} />;
  if (step === 'thank-you-signature') return <ThankYouMessage setStep={setStep} category="signature" />;
  if (step === 'thank-you-left-at-door') return <ThankYouMessage setStep={setStep} category="left-at-door" />;
  return null;
}