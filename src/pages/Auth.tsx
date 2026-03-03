import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Stethoscope, AlertCircle, Sparkles, ArrowLeft, ArrowRight, Loader2, Mail, Check, Activity } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logoSvg from '@/assets/logo.svg';
import { SignupStepper } from '@/components/auth/SignupStepper';
import { AccountTypeSelector, type AccountType } from '@/components/auth/AccountTypeSelector';
import { AccountSetupStep } from '@/components/auth/signup-steps/AccountSetupStep';
import { ProfessionalDetailsStep } from '@/components/auth/signup-steps/ProfessionalDetailsStep';
import { DoctorVerificationStep } from '@/components/auth/signup-steps/DoctorVerificationStep';
import { PracticeDetailsStep } from '@/components/auth/signup-steps/PracticeDetailsStep';
import { ReviewSubmitStep } from '@/components/auth/signup-steps/ReviewSubmitStep';
import { CenterDetailsStep, type CenterDetailsData } from '@/components/auth/signup-steps/CenterDetailsStep';
import { CenterVerificationStep, type CenterVerificationData } from '@/components/auth/signup-steps/CenterVerificationStep';
import { HospitalDetailsStep, type HospitalDetailsData } from '@/components/auth/signup-steps/HospitalDetailsStep';
import { HospitalVerificationStep, type HospitalVerificationData } from '@/components/auth/signup-steps/HospitalVerificationStep';
import { OrgReviewStep } from '@/components/auth/signup-steps/OrgReviewStep';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const phoneSchema = z.string().min(10, 'Please enter a valid mobile number');

const DOCTOR_STEPS = [
  { title: 'Account', description: 'Basic account details' },
  { title: 'Professional', description: 'Your qualifications' },
  { title: 'Verification', description: 'Doctor verification' },
  { title: 'Practice', description: 'Your practice info' },
  { title: 'Review', description: 'Review & submit' }
];

const CENTER_STEPS = [
  { title: 'Account', description: 'Admin account' },
  { title: 'Center Info', description: 'Center details' },
  { title: 'Verification', description: 'Accreditation' },
  { title: 'Review', description: 'Review & submit' }
];

const HOSPITAL_STEPS = [
  { title: 'Account', description: 'Admin account' },
  { title: 'Hospital Info', description: 'Hospital details' },
  { title: 'Verification', description: 'Registration' },
  { title: 'Review', description: 'Review & submit' }
];

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'signup-type' | 'signup' | 'success' | 'forgot-password' | 'reset-sent'>('login');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [signupStep, setSignupStep] = useState(0);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Forgot password
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  
  // Shared account data
  const [accountData, setAccountData] = useState({
    fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: ''
  });
  
  // Doctor-specific
  const [professionalData, setProfessionalData] = useState({
    primaryQualification: '', specialization: '', yearsOfExperience: '', languagesSpoken: [] as string[]
  });
  const [verificationData, setVerificationData] = useState({
    medicalCouncilNumber: '', registeringAuthority: '', registrationYear: '',
    degreeCertificate: null as File | null, idProof: null as File | null, professionalPhoto: null as File | null
  });
  const [practiceData, setPracticeData] = useState({
    clinicName: '', clinicAddress: '', city: '', state: '', consultationType: ''
  });
  
  // Center-specific
  const [centerDetails, setCenterDetails] = useState<CenterDetailsData>({
    centerName: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', website: ''
  });
  const [centerVerification, setCenterVerification] = useState<CenterVerificationData>({
    accreditationNumber: '', accreditationType: '', gstNumber: '',
    registrationCertificate: null, ownerIdProof: null
  });
  
  // Hospital-specific
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetailsData>({
    hospitalName: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', website: '', numBeds: '', departments: []
  });
  const [hospitalVerification, setHospitalVerification] = useState<HospitalVerificationData>({
    registrationNumber: '', accreditationNumber: '', gstNumber: '',
    clinicalEstablishmentLicense: null, registrationCertificate: null, ownerIdProof: null, letterhead: null
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Errors
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [professionalErrors, setProfessionalErrors] = useState<Record<string, string>>({});
  const [verificationErrors, setVerificationErrors] = useState<Record<string, string>>({});
  const [practiceErrors, setPracticeErrors] = useState<Record<string, string>>({});
  const [centerDetailsErrors, setCenterDetailsErrors] = useState<Record<string, string>>({});
  const [centerVerificationErrors, setCenterVerificationErrors] = useState<Record<string, string>>({});
  const [hospitalDetailsErrors, setHospitalDetailsErrors] = useState<Record<string, string>>({});
  const [hospitalVerificationErrors, setHospitalVerificationErrors] = useState<Record<string, string>>({});
  const [termsError, setTermsError] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const getSteps = () => {
    if (accountType === 'diagnostic_center') return CENTER_STEPS;
    if (accountType === 'hospital') return HOSPITAL_STEPS;
    return DOCTOR_STEPS;
  };

  const getStepTitle = () => {
    if (accountType === 'diagnostic_center') return 'Diagnostic Center Registration';
    if (accountType === 'hospital') return 'Hospital Registration';
    return 'Doctor Registration';
  };

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try { emailSchema.parse(loginEmail); passwordSchema.parse(loginPassword); }
    catch (err) { if (err instanceof z.ZodError) { setLoginError(err.errors[0].message); return; } }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      setLoginError(error.message.includes('Invalid login credentials') ? 'Invalid email or password. Please try again.' : error.message);
    }
  };

  // ── Forgot password ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    try { emailSchema.parse(resetEmail); } catch (err) { if (err instanceof z.ZodError) { setResetError(err.errors[0].message); return; } }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
    setIsLoading(false);
    if (error) { setResetError(error.message); return; }
    setView('reset-sent');
  };

  // ── Validation helpers ──
  const validateAccountStep = () => {
    const errors: Record<string, string> = {};
    if (!accountData.fullName.trim()) errors.fullName = 'Full name is required';
    try { emailSchema.parse(accountData.email); } catch { errors.email = 'Please enter a valid email address'; }
    try { phoneSchema.parse(accountData.mobileNumber.replace(/\s/g, '')); } catch { errors.mobileNumber = 'Please enter a valid mobile number'; }
    try { passwordSchema.parse(accountData.password); } catch { errors.password = 'Password must be at least 6 characters'; }
    if (accountData.password !== accountData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfessionalStep = () => {
    const errors: Record<string, string> = {};
    if (!professionalData.primaryQualification) errors.primaryQualification = 'Primary qualification is required';
    if (!professionalData.yearsOfExperience) errors.yearsOfExperience = 'Years of experience is required';
    if (professionalData.languagesSpoken.length === 0) errors.languagesSpoken = 'Please select at least one language';
    setProfessionalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateVerificationStep = () => {
    const errors: Record<string, string> = {};
    if (!verificationData.medicalCouncilNumber.trim()) errors.medicalCouncilNumber = 'Registration number is required';
    if (!verificationData.registeringAuthority) errors.registeringAuthority = 'Registering authority is required';
    if (!verificationData.registrationYear) errors.registrationYear = 'Registration year is required';
    if (!verificationData.degreeCertificate) errors.degreeCertificate = 'Degree certificate is required';
    if (!verificationData.idProof) errors.idProof = 'ID proof is required';
    if (!verificationData.professionalPhoto) errors.professionalPhoto = 'Professional photo is required';
    setVerificationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePracticeStep = () => {
    const errors: Record<string, string> = {};
    if (!practiceData.clinicName.trim()) errors.clinicName = 'Clinic/Hospital name is required';
    if (!practiceData.clinicAddress.trim()) errors.clinicAddress = 'Address is required';
    if (!practiceData.city.trim()) errors.city = 'City is required';
    if (!practiceData.state) errors.state = 'State is required';
    if (!practiceData.consultationType) errors.consultationType = 'Please select a consultation type';
    setPracticeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCenterDetails = () => {
    const errors: Record<string, string> = {};
    if (!centerDetails.centerName.trim()) errors.centerName = 'Center name is required';
    if (!centerDetails.email.trim()) errors.email = 'Email is required';
    if (!centerDetails.phone.trim()) errors.phone = 'Phone is required';
    if (!centerDetails.address.trim()) errors.address = 'Address is required';
    if (!centerDetails.city.trim()) errors.city = 'City is required';
    if (!centerDetails.state) errors.state = 'State is required';
    setCenterDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCenterVerification = () => {
    const errors: Record<string, string> = {};
    if (!centerVerification.accreditationType) errors.accreditationType = 'Accreditation type is required';
    if (!centerVerification.accreditationNumber.trim()) errors.accreditationNumber = 'License number is required';
    if (!centerVerification.gstNumber.trim()) errors.gstNumber = 'GST number is required';
    if (!centerVerification.registrationCertificate) errors.registrationCertificate = 'Registration certificate is required';
    if (!centerVerification.ownerIdProof) errors.ownerIdProof = 'ID proof is required';
    setCenterVerificationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateHospitalDetails = () => {
    const errors: Record<string, string> = {};
    if (!hospitalDetails.hospitalName.trim()) errors.hospitalName = 'Hospital name is required';
    if (!hospitalDetails.email.trim()) errors.email = 'Email is required';
    if (!hospitalDetails.phone.trim()) errors.phone = 'Phone is required';
    if (!hospitalDetails.address.trim()) errors.address = 'Address is required';
    if (!hospitalDetails.city.trim()) errors.city = 'City is required';
    if (!hospitalDetails.state) errors.state = 'State is required';
    if (!hospitalDetails.numBeds) errors.numBeds = 'Number of beds is required';
    if (hospitalDetails.departments.length === 0) errors.departments = 'Select at least one department';
    setHospitalDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateHospitalVerification = () => {
    const errors: Record<string, string> = {};
    if (!hospitalVerification.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required';
    if (!hospitalVerification.gstNumber.trim()) errors.gstNumber = 'GST number is required';
    if (!hospitalVerification.clinicalEstablishmentLicense) errors.clinicalEstablishmentLicense = 'License is required';
    if (!hospitalVerification.registrationCertificate) errors.registrationCertificate = 'Certificate is required';
    if (!hospitalVerification.ownerIdProof) errors.ownerIdProof = 'ID proof is required';
    setHospitalVerificationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Step navigation ──
  const handleNextStep = () => {
    let isValid = false;
    const steps = getSteps();

    if (accountType === 'doctor') {
      switch (signupStep) {
        case 0: isValid = validateAccountStep(); break;
        case 1: isValid = validateProfessionalStep(); break;
        case 2: isValid = validateVerificationStep(); break;
        case 3: isValid = validatePracticeStep(); break;
        default: isValid = true;
      }
    } else if (accountType === 'diagnostic_center') {
      switch (signupStep) {
        case 0: isValid = validateAccountStep(); break;
        case 1: isValid = validateCenterDetails(); break;
        case 2: isValid = validateCenterVerification(); break;
        default: isValid = true;
      }
    } else if (accountType === 'hospital') {
      switch (signupStep) {
        case 0: isValid = validateAccountStep(); break;
        case 1: isValid = validateHospitalDetails(); break;
        case 2: isValid = validateHospitalVerification(); break;
        default: isValid = true;
      }
    }

    if (isValid) {
      setSignupStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevStep = () => {
    setSignupStep(prev => Math.max(prev - 1, 0));
  };

  // ── File upload helper ──
  const uploadFile = async (file: File, userId: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
    const bucket = accountType === 'doctor' ? 'doctor-documents' : 'org-documents';
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) { console.error('Upload error:', error); return null; }
    return fileName;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!termsAccepted) { setTermsError('Please accept the terms and conditions'); return; }
    setTermsError('');
    setIsLoading(true);

    try {
      const roleForSignup = accountType === 'diagnostic_center' ? 'center_admin' : accountType === 'hospital' ? 'hospital_admin' : 'doctor';
      const { error: signUpError } = await signUp(accountData.email, accountData.password, accountData.fullName, roleForSignup);
      if (signUpError) {
        toast({
          title: signUpError.message.includes('already registered') ? 'Email already registered' : 'Signup failed',
          description: signUpError.message.includes('already registered') ? 'This email is already registered. Please log in instead.' : signUpError.message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const userId = session.user.id;

        if (accountType === 'doctor') {
          // Upload doctor files
          const [degreeUrl, idProofUrl, photoUrl] = await Promise.all([
            verificationData.degreeCertificate ? uploadFile(verificationData.degreeCertificate, userId, 'degree') : null,
            verificationData.idProof ? uploadFile(verificationData.idProof, userId, 'id-proof') : null,
            verificationData.professionalPhoto ? uploadFile(verificationData.professionalPhoto, userId, 'photo') : null
          ]);

          await supabase.from('profiles').update({
            mobile_number: accountData.mobileNumber,
            specialization: professionalData.specialization,
            primary_qualification: professionalData.primaryQualification,
            years_of_experience: parseInt(professionalData.yearsOfExperience) || 0,
            languages_spoken: professionalData.languagesSpoken,
            medical_council_number: verificationData.medicalCouncilNumber,
            registering_authority: verificationData.registeringAuthority,
            registration_year: parseInt(verificationData.registrationYear) || null,
            degree_certificate_url: degreeUrl,
            id_proof_url: idProofUrl,
            professional_photo_url: photoUrl,
            clinic_name: practiceData.clinicName,
            clinic_address: practiceData.clinicAddress,
            city: practiceData.city,
            state: practiceData.state,
            consultation_type: practiceData.consultationType,
            verification_status: 'pending'
          }).eq('id', userId);

        } else if (accountType === 'diagnostic_center') {
          // Upload center docs
          const [certUrl, idUrl] = await Promise.all([
            centerVerification.registrationCertificate ? uploadFile(centerVerification.registrationCertificate, userId, 'registration-cert') : null,
            centerVerification.ownerIdProof ? uploadFile(centerVerification.ownerIdProof, userId, 'owner-id') : null,
          ]);

          // Create organization
          const { data: org, error: orgError } = await supabase.from('organizations').insert({
            owner_id: userId,
            type: 'diagnostic_center' as any,
            name: centerDetails.centerName,
            email: centerDetails.email,
            phone: centerDetails.phone,
            address: centerDetails.address,
            city: centerDetails.city,
            state: centerDetails.state,
            pincode: centerDetails.pincode,
            website: centerDetails.website,
            accreditation_number: centerVerification.accreditationNumber,
            accreditation_type: centerVerification.accreditationType,
            gst_number: centerVerification.gstNumber,
            registration_certificate_url: certUrl,
            owner_id_proof_url: idUrl,
          }).select('id').single();

          if (org && !orgError) {
            // Create main branch
            await supabase.from('org_branches').insert({
              organization_id: org.id,
              name: `${centerDetails.centerName} - Main`,
              address: centerDetails.address,
              city: centerDetails.city,
              state: centerDetails.state,
              pincode: centerDetails.pincode,
              phone: centerDetails.phone,
              email: centerDetails.email,
              is_main_branch: true,
              manager_id: userId,
            });

            // Add owner as member
            await supabase.from('organization_members').insert({
              organization_id: org.id,
              user_id: userId,
              role: 'owner' as any,
            });
          }

          // Update profile
          await supabase.from('profiles').update({
            mobile_number: accountData.mobileNumber,
            verification_status: 'pending',
          }).eq('id', userId);

        } else if (accountType === 'hospital') {
          // Upload hospital docs
          const [licenseUrl, certUrl, idUrl, letterheadUrl] = await Promise.all([
            hospitalVerification.clinicalEstablishmentLicense ? uploadFile(hospitalVerification.clinicalEstablishmentLicense, userId, 'license') : null,
            hospitalVerification.registrationCertificate ? uploadFile(hospitalVerification.registrationCertificate, userId, 'registration-cert') : null,
            hospitalVerification.ownerIdProof ? uploadFile(hospitalVerification.ownerIdProof, userId, 'owner-id') : null,
            hospitalVerification.letterhead ? uploadFile(hospitalVerification.letterhead, userId, 'letterhead') : null,
          ]);

          // Create organization
          const { data: org, error: orgError } = await supabase.from('organizations').insert({
            owner_id: userId,
            type: 'hospital' as any,
            name: hospitalDetails.hospitalName,
            email: hospitalDetails.email,
            phone: hospitalDetails.phone,
            address: hospitalDetails.address,
            city: hospitalDetails.city,
            state: hospitalDetails.state,
            pincode: hospitalDetails.pincode,
            website: hospitalDetails.website,
            num_beds: parseInt(hospitalDetails.numBeds) || null,
            departments: hospitalDetails.departments,
            registration_number: hospitalVerification.registrationNumber,
            accreditation_number: hospitalVerification.accreditationNumber,
            gst_number: hospitalVerification.gstNumber,
            clinical_establishment_license_url: licenseUrl,
            registration_certificate_url: certUrl,
            owner_id_proof_url: idUrl,
            letterhead_url: letterheadUrl,
          }).select('id').single();

          if (org && !orgError) {
            await supabase.from('org_branches').insert({
              organization_id: org.id,
              name: `${hospitalDetails.hospitalName} - Main`,
              address: hospitalDetails.address,
              city: hospitalDetails.city,
              state: hospitalDetails.state,
              pincode: hospitalDetails.pincode,
              phone: hospitalDetails.phone,
              email: hospitalDetails.email,
              is_main_branch: true,
              manager_id: userId,
            });

            await supabase.from('organization_members').insert({
              organization_id: org.id,
              user_id: userId,
              role: 'owner' as any,
            });
          }

          await supabase.from('profiles').update({
            mobile_number: accountData.mobileNumber,
            verification_status: 'pending',
          }).eq('id', userId);
        }
      }

      setView('success');
    } catch (error) {
      console.error('Signup error:', error);
      toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'destructive' });
    }

    setIsLoading(false);
  };

  // ── Render step content ──
  const renderStepContent = () => {
    if (accountType === 'doctor') {
      switch (signupStep) {
        case 0: return <AccountSetupStep data={accountData} onChange={(d) => setAccountData(prev => ({ ...prev, ...d }))} errors={accountErrors} />;
        case 1: return <ProfessionalDetailsStep data={professionalData} onChange={(d) => setProfessionalData(prev => ({ ...prev, ...d }))} errors={professionalErrors} />;
        case 2: return <DoctorVerificationStep data={verificationData} onChange={(d) => setVerificationData(prev => ({ ...prev, ...d }))} errors={verificationErrors} />;
        case 3: return <PracticeDetailsStep data={practiceData} onChange={(d) => setPracticeData(prev => ({ ...prev, ...d }))} errors={practiceErrors} />;
        case 4: return <ReviewSubmitStep data={{ account: accountData, professional: professionalData, verification: verificationData, practice: practiceData, termsAccepted }} onTermsChange={setTermsAccepted} error={termsError} />;
      }
    } else if (accountType === 'diagnostic_center') {
      switch (signupStep) {
        case 0: return <AccountSetupStep data={accountData} onChange={(d) => setAccountData(prev => ({ ...prev, ...d }))} errors={accountErrors} />;
        case 1: return <CenterDetailsStep data={centerDetails} onChange={(d) => setCenterDetails(prev => ({ ...prev, ...d }))} errors={centerDetailsErrors} />;
        case 2: return <CenterVerificationStep data={centerVerification} onChange={(d) => setCenterVerification(prev => ({ ...prev, ...d }))} errors={centerVerificationErrors} />;
        case 3: return <OrgReviewStep accountType="diagnostic_center" accountData={accountData} centerDetails={centerDetails} centerVerification={centerVerification} termsAccepted={termsAccepted} onTermsChange={setTermsAccepted} error={termsError} />;
      }
    } else if (accountType === 'hospital') {
      switch (signupStep) {
        case 0: return <AccountSetupStep data={accountData} onChange={(d) => setAccountData(prev => ({ ...prev, ...d }))} errors={accountErrors} />;
        case 1: return <HospitalDetailsStep data={hospitalDetails} onChange={(d) => setHospitalDetails(prev => ({ ...prev, ...d }))} errors={hospitalDetailsErrors} />;
        case 2: return <HospitalVerificationStep data={hospitalVerification} onChange={(d) => setHospitalVerification(prev => ({ ...prev, ...d }))} errors={hospitalVerificationErrors} />;
        case 3: return <OrgReviewStep accountType="hospital" accountData={accountData} hospitalDetails={hospitalDetails} hospitalVerification={hospitalVerification} termsAccepted={termsAccepted} onTermsChange={setTermsAccepted} error={termsError} />;
      }
    }
    return null;
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center animate-pulse">
            <img src={logoSvg} alt="CareTag Logo" className="h-12 w-12" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-foreground font-semibold">CareTag</span>
            <span className="text-muted-foreground text-sm italic">Your Health, Simplified</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (view === 'success') {
    const successMessage = accountType === 'doctor'
      ? 'Your doctor registration application has been submitted successfully.'
      : accountType === 'diagnostic_center'
      ? 'Your diagnostic center registration has been submitted successfully.'
      : 'Your hospital registration has been submitted successfully.';

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md border-border/50 shadow-xl shadow-black/5 rounded-2xl text-center">
          <CardContent className="p-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">{successMessage} Our team will verify your credentials within 24-48 hours.</p>
            <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
              <p className="text-sm">
                <span className="font-medium">Verification Status:</span>{' '}
                <span className="text-amber-500">Pending Review</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll receive an email once your account is verified.
              </p>
            </div>
            <Button className="w-full h-11 rounded-xl font-semibold" onClick={() => setView('login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Reset sent ──
  if (view === 'reset-sent') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md border-border/50 shadow-xl shadow-black/5 rounded-2xl text-center">
          <CardContent className="p-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <span className="font-medium text-foreground">{resetEmail}</span>.
            </p>
            <div className="space-y-3">
              <Button className="w-full h-11 rounded-xl font-semibold" onClick={() => setView('login')}>Back to Login</Button>
              <Button variant="ghost" className="w-full h-11 rounded-xl" onClick={() => { setView('forgot-password'); setResetEmail(''); }}>Try Different Email</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Forgot password ──
  if (view === 'forgot-password') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-3">
              <img src={logoSvg} alt="CareTag Logo" className="h-11 w-11" />
              <span className="text-2xl font-bold tracking-tight">CareTag</span>
            </div>
            <span className="text-sm text-muted-foreground italic">Your Health, Simplified</span>
          </div>
          <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl">
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
              <CardDescription className="text-base">Enter your email and we'll send you a reset link</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {resetError && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />{resetError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">Email Address</Label>
                  <Input id="reset-email" type="email" placeholder="doctor@hospital.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="h-11 rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/25" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</> : 'Send Reset Link'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1" onClick={() => { setView('login'); setResetError(''); }}>
                  <ArrowLeft className="h-3.5 w-3.5" />Back to Login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main layout ──
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sidebar-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sidebar-primary/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 relative z-10">
          <img src={logoSvg} alt="CareTag Logo" className="h-11 w-11" />
          <span className="text-2xl font-bold text-sidebar-foreground tracking-tight">CareTag</span>
        </div>
        <div className="space-y-10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sidebar-accent/50 text-sidebar-foreground/80 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />Your Health, Simplified
            </div>
            <h1 className="text-5xl font-bold text-sidebar-foreground leading-tight tracking-tight">
              Medical Records<br />at Your Fingertips
            </h1>
          </div>
          <p className="text-lg text-sidebar-foreground/70 leading-relaxed max-w-md">
            Access patient data instantly with CareTag RFID technology. Streamline consultations, prescriptions, and emergency care.
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-accent/60 shadow-sm"><Stethoscope className="h-6 w-6" /></div>
              <div><p className="font-semibold text-sidebar-foreground">Instant Access</p><p className="text-sm text-sidebar-foreground/60">Patient records via RFID/QR scan</p></div>
            </div>
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-accent/60 shadow-sm"><Shield className="h-6 w-6" /></div>
              <div><p className="font-semibold text-sidebar-foreground">Verified Providers Only</p><p className="text-sm text-sidebar-foreground/60">Doctors, labs & hospitals verified</p></div>
            </div>
            <div className="flex items-center gap-4 text-sidebar-foreground/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-accent/60 shadow-sm"><Activity className="h-6 w-6" /></div>
              <div><p className="font-semibold text-sidebar-foreground">Real-time Monitoring</p><p className="text-sm text-sidebar-foreground/60">Live vitals from wearables</p></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/40 relative z-10">© 2024 CareTag Healthcare Systems. All rights reserved.</p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 bg-muted/30 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-3">
              <img src={logoSvg} alt="CareTag Logo" className="h-11 w-11" />
              <span className="text-2xl font-bold tracking-tight">CareTag</span>
            </div>
            <span className="text-sm text-muted-foreground italic">Your Health, Simplified</span>
          </div>

          {view === 'login' ? (
            <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl">
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />{loginError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email or Mobile Number</Label>
                    <Input id="login-email" type="text" placeholder="doctor@hospital.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="h-11 rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                      <button type="button" className="text-xs text-primary font-medium hover:underline" onClick={() => setView('forgot-password')}>Forgot Password?</button>
                    </div>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="h-11 rounded-xl" required />
                  </div>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground text-center">
                      <Shield className="h-3.5 w-3.5 inline mr-1" />Only verified healthcare providers can access this platform.
                    </p>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/25" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Signing in...</> : 'Sign In'}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    New to CareTag?{' '}
                    <button className="text-primary font-medium hover:underline" onClick={() => { setView('signup-type'); setAccountType(null); setSignupStep(0); }}>
                      Create an account
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : view === 'signup-type' ? (
            <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => setView('login')}
                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <CardTitle className="text-xl font-bold tracking-tight">Create Account</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <AccountTypeSelector
                  selected={accountType}
                  onSelect={setAccountType}
                  onContinue={() => { setView('signup'); setSignupStep(0); }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 shadow-xl shadow-black/5 rounded-2xl">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => {
                      if (signupStep === 0) { setView('signup-type'); }
                      else { handlePrevStep(); }
                    }}
                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight">{getStepTitle()}</CardTitle>
                    <CardDescription className="text-sm">
                      Step {signupStep + 1} of {getSteps().length}
                    </CardDescription>
                  </div>
                </div>
                <SignupStepper currentStep={signupStep} steps={getSteps()} />
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="min-h-[350px]">
                  {renderStepContent()}
                </div>
                <div className="flex gap-3 mt-6">
                  {signupStep > 0 && (
                    <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl font-medium" onClick={handlePrevStep} disabled={isLoading}>
                      <ArrowLeft className="h-4 w-4 mr-2" />Previous
                    </Button>
                  )}
                  {signupStep < getSteps().length - 1 ? (
                    <Button type="button" className="flex-1 h-11 rounded-xl font-semibold shadow-lg shadow-primary/25" onClick={handleNextStep}>
                      Next<ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="button" className="flex-1 h-11 rounded-xl font-semibold shadow-lg shadow-primary/25" onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</> : 'Submit for Verification'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
