import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Stethoscope, Pill, Calendar, Activity as ActivityIcon, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

const NewPatientModal = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('demographics');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const initialFormData = {
    // Demographics
    id: '',
    name: '',
    age: '',
    race: '',
    gender: '',
    weight: '',
    payer_code: '',
    medical_specialty: '',
    
    // Clinical Diagnosis
    diag_1: '',
    diag_2: '',
    diag_3: '',
    number_diagnoses: '',
    
    // Medications (Individual)
    metformin: 'No',
    repaglinide: 'No',
    nateglinide: 'No',
    chlorpropamide: 'No',
    glimepiride: 'No',
    acetohexamide: 'No',
    glipizide: 'No',
    glyburide: 'No',
    tolbutamide: 'No',
    pioglitazone: 'No',
    rosiglitazone: 'No',
    acarbose: 'No',
    miglitol: 'No',
    troglitazone: 'No',
    tolazamide: 'No',
    examide: 'No',
    citoglipton: 'No',
    insulin: 'No',
    
    // Medications (Combination)
    glyburide_metformin: 'No',
    glipizide_metformin: 'No',
    glimepiride_pioglitazone: 'No',
    metformin_rosiglitazone: 'No',
    metformin_pioglitazone: 'No',
    
    // Admission
    admission_type_id: '',
    admission_source_id: '',
    time_in_hospital: '',
    number_outpatient: '',
    number_emergency: '',
    number_inpatient: '',
    prev_admissions: '',
    
    // Lab
    max_glu_serum: '',
    A1Cresult: '',
    num_lab_procedures: '',
    num_procedures: '',
    num_medications: '',
    lab_score: '',
    
    // Additional fields
    change: 'No',
    diabetesMed: 'No'
  };

  const [formData, setFormData] = useState(initialFormData);

  const tabs = [
    { id: 'demographics', label: 'Demographics', icon: User },
    { id: 'clinical', label: 'Clinical Diagnosis', icon: Stethoscope },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'admission', label: 'Admission', icon: Calendar },
    { id: 'lab', label: 'Lab Results', icon: ActivityIcon }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setActiveTab('demographics');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.race) newErrors.race = 'Race is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPatientData = () => {
    return {
      id: formData.id,
      name: formData.name,
      status: 'not_discharged',
      details: {
        age: parseInt(formData.age) || null,
        race: formData.race || null,
        gender: formData.gender || null,
        weight: formData.weight || null,
        payer_code: formData.payer_code || null,
        medical_specialty: formData.medical_specialty || null,
        diag_1: formData.diag_1 || null,
        diag_2: formData.diag_2 || null,
        diag_3: formData.diag_3 || null,
        number_diagnoses: parseInt(formData.number_diagnoses) || null,
        max_glu_serum: formData.max_glu_serum || null,
        A1Cresult: formData.A1Cresult || null,
        metformin: formData.metformin,
        repaglinide: formData.repaglinide,
        nateglinide: formData.nateglinide,
        chlorpropamide: formData.chlorpropamide,
        glimepiride: formData.glimepiride,
        acetohexamide: formData.acetohexamide,
        glipizide: formData.glipizide,
        glyburide: formData.glyburide,
        tolbutamide: formData.tolbutamide,
        pioglitazone: formData.pioglitazone,
        rosiglitazone: formData.rosiglitazone,
        acarbose: formData.acarbose,
        miglitol: formData.miglitol,
        troglitazone: formData.troglitazone,
        tolazamide: formData.tolazamide,
        examide: formData.examide,
        citoglipton: formData.citoglipton,
        insulin: formData.insulin,
        glyburide_metformin: formData.glyburide_metformin,
        glipizide_metformin: formData.glipizide_metformin,
        glimepiride_pioglitazone: formData.glimepiride_pioglitazone,
        metformin_rosiglitazone: formData.metformin_rosiglitazone,
        metformin_pioglitazone: formData.metformin_pioglitazone,
        change: formData.change,
        diabetesMed: formData.diabetesMed,
        admission_type_id: parseInt(formData.admission_type_id) || null,
        admission_source_id: parseInt(formData.admission_source_id) || null,
        time_in_hospital: parseInt(formData.time_in_hospital) || null,
        num_lab_procedures: parseInt(formData.num_lab_procedures) || null,
        num_procedures: parseInt(formData.num_procedures) || null,
        num_medications: parseInt(formData.num_medications) || null,
        number_outpatient: parseInt(formData.number_outpatient) || null,
        number_emergency: parseInt(formData.number_emergency) || null,
        number_inpatient: parseInt(formData.number_inpatient) || null,
        prev_admissions: parseInt(formData.prev_admissions) || null,
        lab_score: parseFloat(formData.lab_score) || null
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);
    
    try {
      const patientData = formatPatientData();
      
      // Send POST request to backend
      const response = await fetch('https://submammary-correlatively-irma.ngrok-free.dev/customers/CUST1/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Patient created successfully:', result);
      
      // Call the parent onSubmit callback
      await onSubmit(patientData);
      
      // Show success message briefly before closing
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        resetForm(); // Reset form before closing
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting patient data:', error);
      setErrors({ submit: 'Failed to create patient. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (field, label, type = 'text', options = []) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {type === 'select' ? (
        <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'yesno' ? (
        <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Yes/No" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Yes">Yes</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
      {errors[field] && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'demographics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('id', 'Patient ID', 'text')}
              {renderInput('name', 'Patient Name', 'text')}
              {renderInput('age', 'Age', 'number')}
              {renderInput('race', 'Race', 'select', [
                { value: 'Caucasian', label: 'Caucasian' },
                { value: 'AfricanAmerican', label: 'African American' },
                { value: 'Hispanic', label: 'Hispanic' },
                { value: 'Asian', label: 'Asian' },
                { value: 'Other', label: 'Other' }
              ])}
              {renderInput('gender', 'Gender', 'select', [
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ])}
              {renderInput('weight', 'Weight', 'select', [
                { value: '0-25', label: '0-25 lbs' },
                { value: '25-50', label: '25-50 lbs' },
                { value: '50-75', label: '50-75 lbs' },
                { value: '75-100', label: '75-100 lbs' },
                { value: '100-125', label: '100-125 lbs' },
                { value: '125-150', label: '125-150 lbs' },
                { value: '150-175', label: '150-175 lbs' },
                { value: '175-199', label: '175-199 lbs' },
                { value: '200+', label: '200+ lbs' }
              ])}
              {renderInput('payer_code', 'Payer Code', 'text')}
              {renderInput('medical_specialty', 'Medical Specialty', 'text')}
            </div>
          </div>
        );

      case 'clinical':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('diag_1', 'Primary Diagnosis', 'text')}
              {renderInput('diag_2', 'Secondary Diagnosis', 'text')}
              {renderInput('diag_3', 'Tertiary Diagnosis', 'text')}
              {renderInput('number_diagnoses', 'Number of Diagnoses', 'number')}
            </div>
          </div>
        );

      case 'medications':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Medications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride', 'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone', 'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone', 'tolazamide', 'examide', 'citoglipton', 'insulin'].map(med => (
                  <div key={med} className="p-4 border rounded-lg">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {med.replace(/_/g, ' ')}
                    </label>
                    <Select
                      value={formData[med]}
                      onValueChange={(value) => handleInputChange(med, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Yes/No" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Combination Medications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['glyburide_metformin', 'glipizide_metformin', 'glimepiride_pioglitazone', 'metformin_rosiglitazone', 'metformin_pioglitazone'].map(med => (
                  <div key={med} className="p-4 border rounded-lg">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {med.replace(/_/g, ' + ')}
                    </label>
                    <Select
                      value={formData[med]}
                      onValueChange={(value) => handleInputChange(med, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Yes/No" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'admission':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('admission_type_id', 'Admission Type ID', 'number')}
              {renderInput('admission_source_id', 'Admission Source ID', 'number')}
              {renderInput('time_in_hospital', 'Time in Hospital (Days)', 'number')}
              {renderInput('number_outpatient', 'Number of Outpatient Visits', 'number')}
              {renderInput('number_emergency', 'Number of Emergency Visits', 'number')}
              {renderInput('number_inpatient', 'Number of Inpatient Visits', 'number')}
              {renderInput('prev_admissions', 'Previous Admissions', 'number')}
            </div>
          </div>
        );

      case 'lab':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('max_glu_serum', 'Max Glucose Serum', 'text')}
              {renderInput('A1Cresult', 'A1C Result', 'text')}
              {renderInput('num_lab_procedures', 'Number of Lab Procedures', 'number')}
              {renderInput('num_procedures', 'Number of Procedures', 'number')}
              {renderInput('num_medications', 'Number of Medications', 'number')}
              {renderInput('lab_score', 'Lab Score', 'number')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Dark blur background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Add New Patient</h2>
                <p className="text-purple-100 mt-1">Enter comprehensive patient information</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>

              {/* Error message */}
              {errors.submit && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Patient
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600">Patient created successfully and added to the system.</p>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Patient Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this patient with all the provided information? 
              This action will submit the data to the backend and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              resetForm();
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} className="bg-purple-600 hover:bg-purple-700">
              Yes, Create Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};

export default NewPatientModal;
