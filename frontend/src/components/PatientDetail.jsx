import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Activity, 
  Pill, 
  FileText, 
  AlertCircle,
  Heart,
  Stethoscope,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Eye,
  Activity as ActivityIcon,
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('discharge');
  const [isDischarging, setIsDischarging] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch patient details
        const response = await fetch(`https://submammary-correlatively-irma.ngrok-free.dev/customers/CUST1/patients/${patientId}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPatient(data);

        // Fetch prediction data
        const predictionResponse = await fetch(`https://submammary-correlatively-irma.ngrok-free.dev/customers/CUST1/patients/${patientId}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            input: {
              id: patientId
            }
          })
        });

        if (predictionResponse.ok) {
          const predictionResult = await predictionResponse.json();
          setPredictionData(predictionResult);
          
          // Nudges are included in the prediction response
          if (predictionResult.nudges) {
            setNudges(predictionResult.nudges);
          }
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching patient details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  // Set default tab based on patient status
  useEffect(() => {
    if (patient?.status === 'discharged') {
      setActiveTab('monitoring');
    } else {
      setActiveTab('discharge');
    }
  }, [patient?.status]);

  const handleDischargeClick = () => {
    setShowDischargeDialog(true);
  };

  const handleFinalDischarge = async () => {
    try {
      setIsDischarging(true);
      setShowDischargeDialog(false);
      
      // Update patient status to discharged
      const response = await fetch(`https://submammary-correlatively-irma.ngrok-free.dev/customers/CUST1/patients/${patientId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          status: 'discharged'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Patient discharged successfully:', result);

      // Update local state
      setPatient(prev => ({
        ...prev,
        status: 'discharged'
      }));

      // Show success message
      alert('Discharge Complete! Patient has been successfully discharged.');
      
      // Switch to monitoring tab automatically
      setActiveTab('monitoring');
    } catch (err) {
      console.error('Error discharging patient:', err);
      setError('Failed to discharge patient. Please try again.');
    } finally {
      setIsDischarging(false);
    }
  };

  const formatFieldName = (fieldName) => {
    const fieldMappings = {
      // Demographics
      'age': 'Age',
      'race': 'Race',
      'gender': 'Gender',
      'weight': 'Weight',
      'payer_code': 'Payer Code',
      'medical_specialty': 'Patient Major Condition',
      
      // Clinical Diagnosis
      'diag_1': 'Primary Diagnosis',
      'diag_2': 'Secondary Diagnosis',
      'diag_3': 'Tertiary Diagnosis',
      'number_diagnoses': 'Count of Diagnoses',
      
      // Individual Medications
      'metformin': 'Metformin',
      'repaglinide': 'Repaglinide',
      'nateglinide': 'Nateglinide',
      'chlorpropamide': 'Chlorpropamide',
      'glimepiride': 'Glimepiride',
      'acetohexamide': 'Acetohexamide',
      'glipizide': 'Glipizide',
      'glyburide': 'Glyburide',
      'tolbutamide': 'Tolbutamide',
      'pioglitazone': 'Pioglitazone',
      'rosiglitazone': 'Rosiglitazone',
      'acarbose': 'Acarbose',
      'miglitol': 'Miglitol',
      'troglitazone': 'Troglitazone',
      'tolazamide': 'Tolazamide',
      'examide': 'Examide',
      'citoglipton': 'Citoglipton',
      'insulin': 'Insulin',
      
      // Combination Medications
      'glyburide_metformin': 'Glyburide + Metformin',
      'glipizide_metformin': 'Glipizide + Metformin',
      'glimepiride_pioglitazone': 'Glimepiride + Pioglitazone',
      'metformin_rosiglitazone': 'Metformin + Rosiglitazone',
      'metformin_pioglitazone': 'Metformin + Pioglitazone',
      
      // Admission
      'admission_type_id': 'Admission Type',
      'admission_source_id': 'Admission Source',
      'time_in_hospital': 'Length of Stay (Days)',
      'number_outpatient': 'Prior Outpatient Visits',
      'number_emergency': 'Prior ER Visits',
      'number_inpatient': 'Prior Inpatient Visits',
      'prev_admissions': 'Total Previous Admissions',
      
      // Lab
      'max_glu_serum': 'Glucose Serum Test',
      'A1Cresult': 'HbA1c Result',
      'num_lab_procedures': 'Count of Labs Ordered',
      'num_procedures': 'Procedures (Non-Lab) Count',
      'num_medications': 'Count of Prescribed Medications',
      'lab_score': 'Lab Score'
    };
    
    return fieldMappings[fieldName] || fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFieldIcon = (fieldName) => {
    if (fieldName.includes('age') || fieldName.includes('time') || fieldName.includes('num_') || fieldName.includes('number_')) {
      return <Calendar className="w-4 h-4" />;
    } else if (fieldName.includes('diag') || fieldName.includes('medical') || fieldName.includes('admission')) {
      return <FileText className="w-4 h-4" />;
    } else if (fieldName.includes('med') || fieldName.includes('insulin') || fieldName.includes('glu') || fieldName.includes('A1C')) {
      return <Pill className="w-4 h-4" />;
    } else if (fieldName.includes('race') || fieldName.includes('gender') || fieldName.includes('weight')) {
      return <User className="w-4 h-4" />;
    } else {
      return <Activity className="w-4 h-4" />;
    }
  };

  const getFieldValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value;
  };



  const getRiskColor = (band) => {
    switch (band?.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score <= 0.3) return 'text-green-600';
    if (score <= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTopFeatures = (topFeatures) => {
    return Object.entries(topFeatures)
      .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
      .slice(0, 10);
  };

  const tabs = patient?.status === 'discharged' ? [
    { id: 'monitoring', label: 'Patient Monitoring', icon: Activity },
    { id: 'overview', label: 'Demographics', icon: User },
    { id: 'clinical', label: 'Clinical Diagnosis', icon: Stethoscope },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'admission', label: 'Admission', icon: Calendar },
    { id: 'lab', label: 'Lab Results', icon: ActivityIcon }
  ] : [
    { id: 'discharge', label: 'Discharge Analysis', icon: CheckCircle },
    { id: 'overview', label: 'Demographics', icon: User },
    { id: 'clinical', label: 'Clinical Diagnosis', icon: Stethoscope },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'admission', label: 'Admission', icon: Calendar },
    { id: 'lab', label: 'Lab Results', icon: ActivityIcon }
  ];


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Patient Details</h2>
          <p className="text-gray-600">Please wait while we fetch the information...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Patient</h2>
          <p className="text-red-600 mb-8 text-lg">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <User className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">The requested patient could not be found.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Filter out null/undefined/empty values and create field groups
  const demographicInfo = {};
  const clinicalDiagnosisInfo = {};
  const individualMedications = {};
  const combinationMedications = {};
  const admissionInfo = {};
  const labInfo = {};

  // Access data from patient.details object
  const patientDetails = patient.details || {};

  Object.entries(patientDetails).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      // Demographic fields
      if (['age', 'race', 'gender', 'weight'].includes(key)) {
        demographicInfo[key] = value;
      }
      // Insurance/Financial
      else if (key === 'payer_code') {
        demographicInfo[key] = value;
      }
      // Patient major condition (renamed from medical_specialty)
      else if (key === 'medical_specialty') {
        demographicInfo[key] = value;
      }
      // Clinical Diagnosis fields
      else if (['diag_1', 'diag_2', 'diag_3', 'number_diagnoses'].includes(key)) {
        clinicalDiagnosisInfo[key] = value;
      }
      // Individual medications (only show if value is 'Yes')
      else if (['metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride', 'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone', 'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone', 'tolazamide', 'examide', 'citoglipton', 'insulin'].includes(key) && value === 'Yes') {
        individualMedications[key] = value;
      }
      // Combination medications (only show if value is 'Yes')
      else if (['glyburide_metformin', 'glipizide_metformin', 'glimepiride_pioglitazone', 'metformin_rosiglitazone', 'metformin_pioglitazone'].includes(key) && value === 'Yes') {
        combinationMedications[key] = value;
      }
      // Admission fields
      else if (['admission_type_id', 'admission_source_id', 'time_in_hospital', 'number_outpatient', 'number_emergency', 'number_inpatient', 'prev_admissions'].includes(key)) {
        admissionInfo[key] = value;
      }
      // Lab fields
      else if (['max_glu_serum', 'A1Cresult', 'num_lab_procedures', 'num_procedures', 'num_medications', 'lab_score'].includes(key)) {
        labInfo[key] = value;
      }
    }
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Dashboard</span>
              </motion.button>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <User className="w-6 h-6 text-purple-400" />
                </motion.div>
                <div>
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {patient.name || `Patient ${patientId}`}
                    </h1>
                    {patient.details?.latest_band && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Risk:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              patient.details.latest_band === 'low' ? 'bg-green-500' : 
                              patient.details.latest_band === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${patient.details.latest_band === 'low' ? '25' : patient.details.latest_band === 'medium' ? '60' : '90'}%` }}
                          ></div>
                        </div>
                        <Badge className={`text-xs px-2 py-1 ${
                          patient.details.latest_band === 'low' ? 'text-green-600 bg-green-100' :
                          patient.details.latest_band === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                          'text-red-600 bg-red-100'
                        }`}>
                          {patient.details.latest_band.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">Patient ID: {patientId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {patient.status === 'not_discharged' ? (
                <motion.button
                  whileHover={{ scale: isDischarging ? 1 : 1.05 }}
                  whileTap={{ scale: isDischarging ? 1 : 0.95 }}
                  disabled={isDischarging}
                  className={`px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center space-x-2 ${
                    isDischarging 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl'
                  } text-white`}
                  onClick={handleDischargeClick}
                >
                  {isDischarging ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Discharging...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Discharge Patient</span>
                    </>
                  )}
                </motion.button>
              ) : patient.status === 'discharged' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Discharged</span>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'discharge' && (
                  <div className="space-y-6">
                    {predictionData ? (
                      <>
                        {/* Risk Assessment */}
                        <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                              <BarChart3 className="w-5 h-5 text-purple-400" />
                              <span>Risk Assessment</span>
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              AI-powered prediction analysis for readmission risk
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30">
                                <div className={`text-4xl font-bold mb-2 ${getRiskScoreColor(predictionData.prediction.risk_score)}`}>
                                  {(predictionData.prediction.risk_score * 100).toFixed(1)}%
                                </div>
                                <div className="text-gray-300">Risk Score</div>
                              </div>
                              <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30">
                                <div className={`text-4xl font-bold mb-2 ${getRiskColor(predictionData.prediction.band).split(' ')[0]}`}>
                                  {predictionData.prediction.band?.toUpperCase()}
                                </div>
                                <div className="text-gray-300">Risk Band</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* AI Explanation */}
                        <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                              <Brain className="w-5 h-5 text-purple-400" />
                              <span>AI Explanation</span>
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              Detailed analysis of factors influencing the risk assessment
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="prose max-w-none">
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {predictionData.prediction.explanation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                      </>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analysis</h3>
                          <p className="text-gray-600">Generating AI-powered discharge recommendations...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Top Contributing Factors and AI Recommendations Side by Side - Only in Discharge Analysis */}
                {activeTab === 'discharge' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Top Contributing Factors - Top 5 Only */}
                    <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                          <span>Top Contributing Factors</span>
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Top 5 features with the highest impact on risk prediction
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {predictionData && Object.entries(predictionData.prediction.top_features)
                            .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                            .slice(0, 5)
                            .map(([feature, value], index) => (
                              <motion.div
                                key={feature}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600/30"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
                                    <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                                  </div>
                                  <span className="font-medium text-gray-200">{formatFieldName(feature)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${value >= 0 ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                  <span className={`text-sm font-semibold ${value >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {value >= 0 ? '+' : ''}{value.toFixed(3)}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    {nudges.length > 0 && (
                      <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-white">
                            <Lightbulb className="w-5 h-5 text-purple-400" />
                            <span>AI Recommendations</span>
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            AI-generated suggestions for post-discharge care
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {nudges.map((nudge, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                                    <CheckCircle className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-white text-sm">
                                      {typeof nudge === 'string' ? nudge : nudge.suggestion}
                                    </p>
                                    {typeof nudge === 'object' && nudge.category && (
                                      <Badge variant="outline" className="mt-1 text-xs border-purple-500/30 text-purple-300">
                                        {nudge.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'monitoring' && (
                  <div className="space-y-8">
                    {/* Monitoring Overview */}
                    <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-2xl text-white">
                          <Activity className="w-6 h-6 text-purple-400" />
                          <span>Patient Monitoring Dashboard</span>
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-300">
                          Post-discharge monitoring and follow-up care
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                            <div className="text-4xl font-bold text-green-400 mb-2">7</div>
                            <div className="text-lg font-semibold text-white">Days Since Discharge</div>
                            <div className="text-sm text-white/60 mt-1">Last updated today</div>
                          </div>
                          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                            <div className="text-4xl font-bold text-blue-400 mb-2">3</div>
                            <div className="text-lg font-semibold text-white">Follow-up Calls</div>
                            <div className="text-sm text-white/60 mt-1">Completed successfully</div>
                          </div>
                          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                            <div className="text-4xl font-bold text-purple-400 mb-2">2</div>
                            <div className="text-lg font-semibold text-white">Email Reminders</div>
                            <div className="text-sm text-white/60 mt-1">Sent this week</div>
                          </div>
                          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                            <div className="text-4xl font-bold text-orange-400 mb-2">95%</div>
                            <div className="text-lg font-semibold text-white">Compliance Rate</div>
                            <div className="text-sm text-white/60 mt-1">Medication adherence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations for Monitoring */}
                    {nudges.length > 0 && (
                      <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-2xl text-white">
                            <Lightbulb className="w-6 h-6 text-purple-400" />
                            <span>AI Recommendations</span>
                          </CardTitle>
                          <CardDescription className="text-lg text-gray-300">
                            AI-generated suggestions for ongoing patient monitoring
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {nudges.map((nudge, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/30"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                                    <CheckCircle className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-white">
                                      {typeof nudge === 'string' ? nudge : nudge.suggestion}
                                    </p>
                                    {typeof nudge === 'object' && nudge.category && (
                                      <Badge variant="outline" className="mt-2 text-xs border-purple-500/30 text-purple-300">
                                        {nudge.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  </div>
                )}

                {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Demographics */}
                <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <User className="w-5 h-5 text-purple-400" />
                      <span>Demographics</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Basic patient demographic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(demographicInfo).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getFieldIcon(key)}
                            <span className="font-medium text-white">{formatFieldName(key)}</span>
                          </div>
                          <span className="text-lg font-semibold text-white">{getFieldValue(value)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance & Financial */}
                <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span>Insurance & Financial</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Insurance and financial background information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patientDetails.payer_code && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Shield className="w-4 h-4 text-white" />
                            <span className="font-medium text-white">Payer Code</span>
                          </div>
                          <span className="text-lg font-semibold text-white">{patientDetails.payer_code}</span>
                        </motion.div>
                      )}
                      {patientDetails.medical_specialty && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Stethoscope className="w-4 h-4 text-white" />
                            <span className="font-medium text-white">Patient Major Condition</span>
                          </div>
                          <span className="text-lg font-semibold text-white">{patientDetails.medical_specialty}</span>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

              {activeTab === 'clinical' && (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Stethoscope className="w-5 h-5 text-purple-400" />
                      <span>Clinical Diagnosis</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Primary, secondary, and tertiary diagnoses with count
                    </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Primary Diagnosis */}
                    {patientDetails.diag_1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-white">Primary Diagnosis</h3>
                        </div>
                        <p className="text-gray-300 text-lg">{patientDetails.diag_1}</p>
                      </motion.div>
                    )}

                    {/* Secondary Diagnosis */}
                    {patientDetails.diag_2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-white">Secondary Diagnosis</h3>
                        </div>
                        <p className="text-gray-300 text-lg">{patientDetails.diag_2}</p>
                      </motion.div>
                    )}

                    {/* Tertiary Diagnosis */}
                    {patientDetails.diag_3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-white">Tertiary Diagnosis</h3>
                        </div>
                        <p className="text-gray-300 text-lg">{patientDetails.diag_3}</p>
                      </motion.div>
                    )}

                    {/* Count of Diagnoses */}
                    {patientDetails.number_diagnoses && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Count of Diagnoses</h3>
                          </div>
                          <div className="text-3xl font-bold text-green-600">{patientDetails.number_diagnoses}</div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
                </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-6">
                  {/* Individual Medications */}
                  {Object.keys(individualMedications).length > 0 && (
                    <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Pill className="w-5 h-5 text-purple-400" />
                          <span>Individual Drugs</span>
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Individual medications currently prescribed
                        </CardDescription>
                      </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(individualMedications).map(([key], index) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600/30 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <Pill className="w-4 h-4 text-white" />
                              <h3 className="font-medium text-white text-sm">{formatFieldName(key)}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-semibold">Prescribed</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                  {/* Combination Medications */}
                  {Object.keys(combinationMedications).length > 0 && (
                    <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Pill className="w-5 h-5 text-purple-400" />
                          <span>Combination Drugs</span>
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Combination medications currently prescribed
                        </CardDescription>
                      </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(combinationMedications).map(([key], index) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600/30 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <Pill className="w-4 h-4 text-white" />
                              <h3 className="font-medium text-white text-sm">{formatFieldName(key)}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-white" />
                              <span className="text-white font-semibold">Prescribed</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                  {/* No Medications Message */}
                  {Object.keys(individualMedications).length === 0 && Object.keys(combinationMedications).length === 0 && (
                    <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                      <CardContent className="text-center py-12">
                        <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Medications Found</h3>
                        <p className="text-gray-300">No medications are currently prescribed for this patient.</p>
                      </CardContent>
                    </Card>
                )}
              </div>
            )}

            {activeTab === 'admission' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span>Admission Details</span>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Admission type, source, and length of stay information
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(admissionInfo).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            {getFieldIcon(key)}
                            <span className="font-medium text-gray-300">{formatFieldName(key)}</span>
                          </div>
                          <span className="text-white font-semibold">{getFieldValue(value)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                  <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <span>Visit History</span>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Previous visits and hospital stay duration
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                        <div className="text-4xl font-bold text-white">{patientDetails.time_in_hospital || 0}</div>
                        <div className="text-gray-300">Length of Stay (Days)</div>
                      </div>
                      <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                        <div className="text-4xl font-bold text-green-400">{patientDetails.prev_admissions || 0}</div>
                        <div className="text-gray-300">Total Previous Admissions</div>
                      </div>
                      <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                        <div className="text-4xl font-bold text-white">{patientDetails.number_outpatient || 0}</div>
                        <div className="text-gray-300">Prior Outpatient Visits</div>
                      </div>
                      <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                        <div className="text-4xl font-bold text-orange-400">{patientDetails.number_emergency || 0}</div>
                        <div className="text-gray-300">Prior ER Visits</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'lab' && (
              <div className="space-y-6">
                  {/* Lab Tests */}
                  <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <ActivityIcon className="w-5 h-5 text-purple-400" />
                        <span>Lab Tests</span>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Laboratory test results and glucose monitoring
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {patientDetails.max_glu_serum && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <ActivityIcon className="w-5 h-5 text-purple-400" />
                            <h3 className="font-semibold text-white">Glucose Serum Test</h3>
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">{patientDetails.max_glu_serum}</div>
                          <div className="text-sm text-gray-300">mg/dL</div>
                        </motion.div>
                      )}
                      {patientDetails.A1Cresult && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <ActivityIcon className="w-5 h-5 text-green-400" />
                            <h3 className="font-semibold text-white">HbA1c Result</h3>
                          </div>
                          <div className="text-3xl font-bold text-green-400 mb-1">{patientDetails.A1Cresult}</div>
                          <div className="text-sm text-gray-300">%</div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                  {/* Lab Metrics */}
                  <Card className="bg-gradient-to-br from-black via-gray-900 to-purple-900 shadow-2xl border border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span>Lab Metrics & Procedures</span>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Count of lab procedures, treatments, and other metrics
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(labInfo).filter(([key]) => key !== 'max_glu_serum' && key !== 'A1Cresult').map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <FileText className="w-5 h-5 text-purple-400" />
                            <h3 className="font-semibold text-white">{formatFieldName(key)}</h3>
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">{getFieldValue(value)}</div>
                          <div className="text-sm text-gray-300">
                            {key.includes('num_') || key.includes('number_') ? 'Count' : 'Score'}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Discharge Confirmation Dialog */}
      <AlertDialog open={showDischargeDialog} onOpenChange={setShowDischargeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Patient Discharge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discharge this patient? This action will mark the patient as discharged and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalDischarge} className="bg-green-600 hover:bg-green-700">
              Yes, Discharge Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientDetail;
