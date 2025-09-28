import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Heart,
  Stethoscope,
  Calendar,
  Pill,
  Shield,
  Zap,
  Brain,
  Eye,
  ChevronRight,
  Star,
  XCircle,
  AlertCircle,
  BarChart3,
  Target,
  Lightbulb,
  BookOpen,
  Users,
  Home
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

const PatientDischarge = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);
  const [isDischarging, setIsDischarging] = useState(false);
  const [activeTab, setActiveTab] = useState('discharge');
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);

  useEffect(() => {
    const fetchDischargeData = async () => {
      try {
        setLoading(true);
        
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

        if (!predictionResponse.ok) {
          throw new Error(`Prediction API error! status: ${predictionResponse.status}`);
        }

        const predictionResult = await predictionResponse.json();
        setPredictionData(predictionResult);

        // Nudges are included in the prediction response
        if (predictionResult.nudges) {
          setNudges(predictionResult.nudges);
        }

        // Fetch patient details
        const patientResponse = await fetch(`https://submammary-correlatively-irma.ngrok-free.dev/customers/CUST1/patients/${patientId}`, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'application/json'
          }
        });

        if (patientResponse.ok) {
          const patientResult = await patientResponse.json();
          setPatientDetails(patientResult);
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching discharge data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchDischargeData();
    }
  }, [patientId]);

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

  const getRiskBarWidth = (score) => {
    return Math.min(score * 100, 100);
  };

  const formatFieldName = (fieldName) => {
    const fieldMappings = {
      'age': 'Age',
      'race': 'Race',
      'gender': 'Gender',
      'weight': 'Weight',
      'payer_code': 'Payer Code',
      'medical_specialty': 'Medical Specialty',
      'diag_1': 'Primary Diagnosis',
      'diag_2': 'Secondary Diagnosis',
      'diag_3': 'Tertiary Diagnosis',
      'max_glu_serum': 'Glucose Serum',
      'A1Cresult': 'HbA1c Result',
      'time_in_hospital': 'Length of Stay',
      'num_lab_procedures': 'Lab Procedures',
      'num_medications': 'Medications Count',
      'number_diagnoses': 'Diagnoses Count'
    };
    
    return fieldMappings[fieldName] || fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTopFeatures = (topFeatures) => {
    return Object.entries(topFeatures)
      .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
      .slice(0, 10);
  };

  // Set default tab based on patient status
  useEffect(() => {
    if (patientDetails?.status === 'discharged') {
      setActiveTab('monitoring');
    } else {
      setActiveTab('discharge');
    }
  }, [patientDetails?.status]);

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
      
      // Update local patient details to reflect discharged status
      setPatientDetails(prev => ({
        ...prev,
        status: 'discharged'
      }));
      
      // Show success message
      alert('Discharge Complete! Patient has been successfully discharged.');
      
      // Switch to monitoring tab automatically
      setActiveTab('monitoring');
      
    } catch (err) {
      console.error('Error discharging patient:', err);
      alert('Failed to discharge patient. Please try again.');
    } finally {
      setIsDischarging(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Patient Data</h2>
          <p className="text-gray-600">Generating discharge recommendations...</p>
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
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
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

  if (!predictionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <User className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-8 text-lg">Unable to load prediction data for this patient.</p>
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

  const prediction = predictionData.prediction;
  const topFeatures = getTopFeatures(prediction.top_features);
  

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
                onClick={() => navigate(`/dashboard/patient/${patientId}`)}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Patient</span>
              </motion.button>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Discharge Process
                  </h1>
                  <p className="text-gray-600">Patient ID: {patientId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Risk Bar */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">Risk Level:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      prediction.band === 'low' ? 'bg-green-500' : 
                      prediction.band === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${getRiskBarWidth(prediction.risk_score)}%` }}
                  ></div>
                </div>
                <Badge className={`text-xs px-2 py-1 ${getRiskColor(prediction.band)}`}>
                  {prediction.band?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
       </motion.div>

       {/* Tab Navigation */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
         <div className="flex border-b border-gray-200">
           {patientDetails?.status === 'discharged' ? (
             <>
               <button
                 onClick={() => setActiveTab('monitoring')}
                 className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                   activeTab === 'monitoring'
                     ? 'border-b-2 border-green-600 text-green-700'
                     : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                 }`}
               >
                 <Activity className="w-4 h-4" />
                 <span>Patient Monitoring</span>
               </button>
               <button
                 onClick={() => setActiveTab('records')}
                 className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                   activeTab === 'records'
                     ? 'border-b-2 border-blue-600 text-blue-700'
                     : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                 }`}
               >
                 <FileText className="w-4 h-4" />
                 <span>Medical Records</span>
               </button>
             </>
           ) : (
             <>
               <button
                 onClick={() => setActiveTab('discharge')}
                 className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                   activeTab === 'discharge'
                     ? 'border-b-2 border-green-600 text-green-700'
                     : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                 }`}
               >
                 <CheckCircle className="w-4 h-4" />
                 <span>Discharge Process</span>
               </button>
               <button
                 onClick={() => setActiveTab('records')}
                 className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                   activeTab === 'records'
                     ? 'border-b-2 border-blue-600 text-blue-700'
                     : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                 }`}
               >
                 <FileText className="w-4 h-4" />
                 <span>Medical Records</span>
               </button>
             </>
           )}
         </div>
       </div>

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
             {activeTab === 'monitoring' ? (
               <div className="space-y-8">
                 <Card className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-2xl">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2 text-2xl text-white">
                       <Activity className="w-6 h-6 text-white" />
                       <span>Patient Monitoring Dashboard</span>
                     </CardTitle>
                     <CardDescription className="text-lg text-white/80">
                       Post-discharge monitoring and follow-up care
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       <div className="text-center p-6 bg-white/20 rounded-xl">
                         <div className="text-4xl font-bold text-green-400 mb-2">7</div>
                         <div className="text-lg font-semibold text-white">Days Since Discharge</div>
                         <div className="text-sm text-white/80 mt-1">Last updated today</div>
                       </div>
                       <div className="text-center p-6 bg-white/20 rounded-xl">
                         <div className="text-4xl font-bold text-blue-400 mb-2">3</div>
                         <div className="text-lg font-semibold text-white">Follow-up Calls</div>
                         <div className="text-sm text-white/80 mt-1">Completed successfully</div>
                       </div>
                       <div className="text-center p-6 bg-white/20 rounded-xl">
                         <div className="text-4xl font-bold text-white mb-2">2</div>
                         <div className="text-lg font-semibold text-white">Email Reminders</div>
                         <div className="text-sm text-white/80 mt-1">Sent this week</div>
                       </div>
                       <div className="text-center p-6 bg-white/20 rounded-xl">
                         <div className="text-4xl font-bold text-orange-400 mb-2">95%</div>
                         <div className="text-lg font-semibold text-white">Compliance Rate</div>
                         <div className="text-sm text-white/80 mt-1">Medication adherence</div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
                 
                 <Card className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-2xl">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2 text-2xl text-white">
                       <FileText className="w-6 h-6 text-white" />
                       <span>Communication Log</span>
                     </CardTitle>
                     <CardDescription className="text-lg text-white/80">
                       Recent interactions and follow-up communications
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-white p-6 rounded-xl shadow-lg">
                       <div className="space-y-4">
                         <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                           <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                             <CheckCircle className="w-5 h-5 text-white" />
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center justify-between">
                               <h4 className="font-semibold text-gray-900">Follow-up Call Completed</h4>
                               <span className="text-sm text-gray-500">2 hours ago</span>
                             </div>
                             <p className="text-gray-700 mt-1">Patient reported feeling well, no complications. Medication adherence confirmed.</p>
                             <div className="flex items-center space-x-2 mt-2">
                               <Badge className="bg-green-100 text-green-800">Completed</Badge>
                               <span className="text-sm text-gray-500">Duration: 15 minutes</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             ) : activeTab === 'discharge' ? (
               <div className="space-y-8">
                 {/* Card 1: Risk Assessment Overview */}
                 <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2 text-2xl">
                       <BarChart3 className="w-6 h-6 text-blue-600" />
                       <span>Risk Assessment Overview</span>
                     </CardTitle>
                     <CardDescription className="text-lg">
                       AI-powered prediction analysis for readmission risk
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                         <div className={`text-6xl font-bold mb-4 ${getRiskScoreColor(prediction.risk_score)}`}>
                           {(prediction.risk_score * 100).toFixed(1)}%
                         </div>
                         <div className="text-xl font-semibold text-gray-700">Risk Score</div>
                         <div className="text-sm text-gray-500 mt-2">Probability of readmission</div>
                       </div>
                       <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                         <div className={`text-6xl font-bold mb-4 ${getRiskColor(prediction.band).split(' ')[0]}`}>
                           {prediction.band?.toUpperCase()}
                         </div>
                         <div className="text-xl font-semibold text-gray-700">Risk Level</div>
                         <div className="text-sm text-gray-500 mt-2">Overall assessment</div>
                       </div>
                       <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                         <div className="text-6xl font-bold mb-4 text-purple-600">
                           {topFeatures.length}
                         </div>
                         <div className="text-xl font-semibold text-gray-700">Key Factors</div>
                         <div className="text-sm text-gray-500 mt-2">Contributing variables</div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Card 2: AI Explanation */}
                 <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2 text-2xl">
                       <Brain className="w-6 h-6 text-green-600" />
                       <span>AI Analysis & Explanation</span>
                     </CardTitle>
                     <CardDescription className="text-lg">
                       Detailed analysis of factors influencing the risk assessment
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-white p-8 rounded-xl shadow-lg">
                       <div className="prose max-w-none text-lg">
                         <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                           {prediction.explanation}
                         </p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Card 3: Top Contributing Factors */}
                 <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2 text-2xl">
                       <TrendingUp className="w-6 h-6 text-orange-600" />
                       <span>Top Contributing Factors</span>
                     </CardTitle>
                     <CardDescription className="text-lg">
                       Features with the highest impact on risk prediction
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-white p-8 rounded-xl shadow-lg">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {topFeatures.map(([feature, impact], index) => (
                           <motion.div
                             key={feature}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: index * 0.1 }}
                             className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200"
                           >
                             <div className="flex items-center space-x-4">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                 impact > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                               }`}>
                                 {index + 1}
                               </div>
                               <div>
                                 <div className="font-semibold text-gray-900 text-lg">{formatFieldName(feature)}</div>
                                 <div className={`text-sm font-medium ${
                                   impact > 0 ? 'text-red-600' : 'text-green-600'
                                 }`}>
                                   {impact > 0 ? 'Increases Risk' : 'Decreases Risk'}
                                 </div>
                               </div>
                             </div>
                             <div className={`text-2xl font-bold ${
                               impact > 0 ? 'text-red-600' : 'text-green-600'
                             }`}>
                               {impact > 0 ? '+' : ''}{impact.toFixed(3)}
                             </div>
                           </motion.div>
                         ))}
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Card 4: Patient Summary & Recommendations */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Patient Vitals */}
                   <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                     <CardHeader>
                       <CardTitle className="flex items-center space-x-2 text-xl">
                         <Heart className="w-5 h-5 text-purple-600" />
                         <span>Patient Summary</span>
                       </CardTitle>
                       <CardDescription>
                         Key information for discharge planning
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="bg-white p-6 rounded-xl shadow-lg">
                         <div className="grid grid-cols-2 gap-4">
                           <div className="text-center p-4 bg-blue-50 rounded-lg">
                             <div className="text-3xl font-bold text-blue-600">{patientDetails?.details?.age || 'N/A'}</div>
                             <div className="text-sm font-medium text-gray-600">Age</div>
                           </div>
                           <div className="text-center p-4 bg-green-50 rounded-lg">
                             <div className="text-3xl font-bold text-green-600">{patientDetails?.details?.gender || 'N/A'}</div>
                             <div className="text-sm font-medium text-gray-600">Gender</div>
                           </div>
                           <div className="text-center p-4 bg-purple-50 rounded-lg">
                             <div className="text-3xl font-bold text-purple-600">{patientDetails?.details?.time_in_hospital || 0}</div>
                             <div className="text-sm font-medium text-gray-600">Days in Hospital</div>
                           </div>
                           <div className="text-center p-4 bg-orange-50 rounded-lg">
                             <div className="text-3xl font-bold text-orange-600">{patientDetails?.details?.num_medications || 0}</div>
                             <div className="text-sm font-medium text-gray-600">Medications</div>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>

                   {/* Recommendations */}
                   <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                     <CardHeader>
                       <CardTitle className="flex items-center space-x-2 text-xl">
                         <Lightbulb className="w-5 h-5 text-cyan-600" />
                         <span>Recommendations</span>
                       </CardTitle>
                       <CardDescription>
                         AI-generated suggestions for post-discharge care
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="bg-white p-6 rounded-xl shadow-lg">
                         <div className="space-y-4">
                           {nudges.length > 0 ? nudges.map((nudge, index) => (
                             <motion.div
                               key={index}
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: index * 0.1 }}
                               className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                             >
                               <div className="flex items-start space-x-3">
                                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                   <CheckCircle className="w-4 h-4 text-white" />
                                 </div>
                                 <div>
                                   <p className="font-semibold text-gray-900">{nudge.suggestion}</p>
                                   <Badge variant="outline" className="mt-2 text-xs">
                                     {nudge.category}
                                   </Badge>
                                 </div>
                               </div>
                             </motion.div>
                           )) : (
                             <div className="text-center py-8 text-gray-500">
                               <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                               <p>No specific recommendations available</p>
                             </div>
                           )}
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </div>

                 {/* Card 5: Discharge Actions */}
                 <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2 text-2xl">
                       <Home className="w-6 h-6 text-gray-600" />
                       <span>Discharge Actions</span>
                     </CardTitle>
                     <CardDescription className="text-lg">
                       Complete the discharge process
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-white p-8 rounded-xl shadow-lg">
                       <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           disabled={isDischarging}
                           onClick={handleDischargeClick}
                           className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                             isDischarging 
                               ? 'bg-gray-400 cursor-not-allowed' 
                               : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                           }`}
                         >
                           {isDischarging ? (
                             <>
                               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                               <span>Discharging...</span>
                             </>
                           ) : (
                             <>
                               <CheckCircle className="w-6 h-6" />
                               <span>Discharge Patient</span>
                             </>
                           )}
                         </motion.button>
                         
                         <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => navigate(`/dashboard/patient/${patientId}`)}
                           className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 bg-gray-200 hover:bg-gray-300 text-gray-700"
                         >
                           <ArrowLeft className="w-6 h-6" />
                           <span>Back to Patient</span>
                         </motion.button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Nudges Section */}
                 {nudges.length > 0 && (
                   <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                     <CardHeader>
                       <CardTitle className="flex items-center space-x-2 text-2xl">
                         <Lightbulb className="w-6 h-6 text-cyan-600" />
                         <span>AI Recommendations</span>
                       </CardTitle>
                       <CardDescription className="text-lg">
                         AI-generated suggestions for post-discharge care
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="bg-white p-6 rounded-xl shadow-lg">
                         <div className="space-y-4">
                           {nudges.map((nudge, index) => (
                             <motion.div
                               key={index}
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: index * 0.1 }}
                               className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                             >
                               <div className="flex items-start space-x-3">
                                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                   <CheckCircle className="w-4 h-4 text-white" />
                                 </div>
                                 <div>
                                   <p className="font-semibold text-gray-900">
                                     {typeof nudge === 'string' ? nudge : nudge.suggestion}
                                   </p>
                                   {typeof nudge === 'object' && nudge.category && (
                                     <Badge variant="outline" className="mt-2 text-xs">
                                       {nudge.category}
                                     </Badge>
                                   )}
                                 </div>
                               </div>
                             </motion.div>
                           ))}
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}
               </div>
      ) : (
        // Medical Records Tab
        <div className="space-y-6">
          {/* Demographics */}
          {patientDetails && patientDetails.details && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Demographics</span>
                </CardTitle>
                <CardDescription>
                  Basic patient demographic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Age</div>
                    <div className="text-2xl font-bold text-gray-900">{patientDetails.details.age || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Gender</div>
                    <div className="text-2xl font-bold text-gray-900">{patientDetails.details.gender || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Race</div>
                    <div className="text-2xl font-bold text-gray-900">{patientDetails.details.race || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Weight</div>
                    <div className="text-2xl font-bold text-gray-900">{patientDetails.details.weight || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Payer Code</div>
                    <div className="text-2xl font-bold text-gray-900">{patientDetails.details.payer_code || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Medical Specialty</div>
                    <div className="text-2xl font-bold text-gray-900">{patientDetails.details.medical_specialty || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clinical Diagnosis */}
          {patientDetails && patientDetails.details && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>Clinical Diagnosis</span>
                </CardTitle>
                <CardDescription>
                  Primary, secondary, and tertiary diagnoses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientDetails.details.diag_1 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm font-medium text-gray-600">Primary Diagnosis</div>
                      <div className="text-lg font-semibold text-gray-900">{patientDetails.details.diag_1}</div>
                    </div>
                  )}
                  {patientDetails.details.diag_2 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-sm font-medium text-gray-600">Secondary Diagnosis</div>
                      <div className="text-lg font-semibold text-gray-900">{patientDetails.details.diag_2}</div>
                    </div>
                  )}
                  {patientDetails.details.diag_3 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-gray-600">Tertiary Diagnosis</div>
                      <div className="text-lg font-semibold text-gray-900">{patientDetails.details.diag_3}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          {patientDetails && patientDetails.details && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="w-5 h-5" />
                  <span>Medications</span>
                </CardTitle>
                <CardDescription>
                  Current medications and prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(patientDetails.details).map(([key, value]) => {
                    if (value === 'Yes' && ['metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride', 'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone', 'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone', 'tolazamide', 'examide', 'citoglipton', 'insulin'].includes(key)) {
                      return (
                        <div key={key} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">{formatFieldName(key)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admission & Lab Results */}
          {patientDetails && patientDetails.details && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Admission Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Length of Stay</span>
                      <span className="text-lg font-semibold text-gray-900">{patientDetails.details.time_in_hospital || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Previous Admissions</span>
                      <span className="text-lg font-semibold text-gray-900">{patientDetails.details.prev_admissions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Outpatient Visits</span>
                      <span className="text-lg font-semibold text-gray-900">{patientDetails.details.number_outpatient || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Lab Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patientDetails.details.max_glu_serum && (
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-700">Glucose Serum</span>
                        <span className="text-lg font-semibold text-gray-900">{patientDetails.details.max_glu_serum}</span>
                      </div>
                    )}
                    {patientDetails.details.A1Cresult && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-gray-700">HbA1c Result</span>
                        <span className="text-lg font-semibold text-gray-900">{patientDetails.details.A1Cresult}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Lab Procedures</span>
                      <span className="text-lg font-semibold text-gray-900">{patientDetails.details.num_lab_procedures || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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

export default PatientDischarge;
