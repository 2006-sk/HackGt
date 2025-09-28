import { 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import NewPatientModal from './NewPatientModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [viewStatus, setViewStatus] = useState('all'); // 'all', 'discharged', 'not_discharged'
  const [patientRisks, setPatientRisks] = useState({}); // Store risk data for each patient
  const [riskDataLoading, setRiskDataLoading] = useState(false); // Loading state for risk data

  // Fetch risk data for all patients in parallel
  const fetchAllPatientRisks = async (patientList) => {
    setRiskDataLoading(true);
    try {
      const riskPromises = patientList.map(async (patient) => {
        try {
          const response = await fetch(`https://submammary-correlatively-irma.ngrok-free.dev/analytics/patients/CUST1/${patient.id}`, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const riskData = await response.json();
            // Get the latest risk data (most recent timestamp)
            if (riskData && riskData.length > 0) {
              const latestRisk = riskData[riskData.length - 1]; // Assuming data is sorted by timestamp
              return { patientId: patient.id, riskData: latestRisk };
            }
          }
          return { patientId: patient.id, riskData: null };
        } catch (error) {
          console.error(`Error fetching risk data for patient ${patient.id}:`, error);
          return { patientId: patient.id, riskData: null };
        }
      });

      const results = await Promise.all(riskPromises);
      
      // Update state with all risk data at once
      const newPatientRisks = {};
      results.forEach(({ patientId, riskData }) => {
        if (riskData) {
          newPatientRisks[patientId] = riskData;
        }
      });
      
      setPatientRisks(newPatientRisks);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setRiskDataLoading(false);
    }
  };

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://submammary-correlatively-irma.ngrok-free.dev/customers/CUST1/patients', {
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
        
        const text = await response.text();
        console.log('Raw response:', text); // Debug log
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
        
        setPatients(data);
        
        // Fetch risk data for all patients in parallel
        fetchAllPatientRisks(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleNewPatientSubmit = async (patientData) => {
    try {
      // Here you would typically send the data to your backend
      // For now, we'll just add it to the local state
      console.log('New patient data:', patientData);
      
      // Add to local state (in a real app, this would be handled by the backend)
      setPatients(prev => [...prev, patientData]);
      
      // Success is handled by the modal closing
      console.log('Patient created successfully!');
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  };

  // Filter patients based on current view
  const getFilteredPatients = () => {
    switch (viewStatus) {
      case 'discharged':
        return patients.filter(p => p.status === 'discharged');
      case 'not_discharged':
        return patients.filter(p => p.status !== 'discharged');
      default:
        return patients;
    }
  };

  const filteredPatients = getFilteredPatients();

  // Helper function to get risk color based on band
  const getRiskColor = (band) => {
    switch (band) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { title: 'Total Patients', value: patients.length.toString(), change: '+12%', icon: Users, color: 'blue' },
    { title: 'Discharged Patients', value: patients.filter(p => p.status === 'discharged').length.toString(), change: '+8%', icon: CheckCircle, color: 'green' },
    { title: 'Active Patients', value: patients.filter(p => p.status !== 'discharged').length.toString(), change: '+15%', icon: Clock, color: 'purple' },
    { title: 'Male Patients', value: patients.filter(p => p.details?.gender === 'Male').length.toString(), change: '+5%', icon: Users, color: 'blue' }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <button 
              onClick={() => setIsNewPatientModalOpen(true)}
              className="bg-gradient-to-br from-gray-900 via-black to-gray-800 hover:from-gray-800 hover:via-gray-900 hover:to-black text-white px-6 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-2xl shadow-black/50 border border-gray-700/50 hover:border-gray-600/70"
            >
                New Patient
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-black via-gray-900 to-purple-900 rounded-xl p-6 shadow-2xl border border-gray-700/50 transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25 relative overflow-hidden">
              {/* Metallic shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2 drop-shadow-lg">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-600/50 shadow-lg">
                  <stat.icon className={`w-6 h-6 text-purple-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full">
          {/* Patients Table */}
          <div className="w-full">
            <div className="bg-gradient-to-br from-black via-gray-900 to-purple-900 rounded-xl shadow-2xl border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-purple-500/25 relative overflow-hidden">
              <div className="p-6 border-b border-gray-700/30">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Patients</h2>
                    <p className="text-gray-300 text-sm mt-1">Manage your patient records</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewStatus('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewStatus === 'all'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                    >
                      All ({patients.length})
                    </button>
                    <button
                      onClick={() => setViewStatus('not_discharged')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewStatus === 'not_discharged'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                    >
                      Active ({patients.filter(p => p.status !== 'discharged').length})
                    </button>
                    <button
                      onClick={() => setViewStatus('discharged')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewStatus === 'discharged'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                    >
                      Discharged ({patients.filter(p => p.status === 'discharged').length})
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    <span className="ml-2 text-gray-300">Loading patients...</span>
                      </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 font-medium">Error loading patients</p>
                    <p className="text-gray-400 text-sm mt-1">{error}</p>
                      </div>
                ) : (
                  <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/30">
                    <TableHead className="text-gray-200 font-semibold">ID</TableHead>
                    <TableHead className="text-gray-200 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-200 font-semibold">Age</TableHead>
                    <TableHead className="text-gray-200 font-semibold">Gender</TableHead>
                    <TableHead className="text-gray-200 font-semibold">Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                    <TableBody>
                      {filteredPatients.length === 0 ? (
                        <TableRow className="border-gray-700/20">
                          <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                            {viewStatus === 'all' 
                              ? 'No patients found' 
                              : viewStatus === 'discharged'
                              ? 'No discharged patients found'
                              : 'No active patients found'
                            }
                          </TableCell>
                        </TableRow>
                      ) : (
                            filteredPatients.map((patient) => (
                          <TableRow key={patient.id} className="border-gray-700/20 hover:bg-gray-800/30 transition-colors">
                            <TableCell className="font-medium text-white">{patient.id}</TableCell>
                            <TableCell>
                              <button
                                onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                                className="text-white hover:text-purple-300 hover:underline font-medium transition-colors"
                              >
                                {patient.name}
                              </button>
                            </TableCell>
                            <TableCell className="text-gray-300">{patient.details?.age || 'N/A'}</TableCell>
                            <TableCell className="text-gray-300">{patient.details?.gender || 'N/A'}</TableCell>
                                <TableCell>
                                  {riskDataLoading ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-600/30">
                                      <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Loading...
                                    </span>
                                  ) : patientRisks[patient.id] ? (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(patientRisks[patient.id].band)}`}>
                                      {patientRisks[patient.id].band?.toUpperCase() || 'N/A'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white/60">
                                      No Data
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSubmit={handleNewPatientSubmit}
      />
    </div>
  );
};

export default Dashboard;
