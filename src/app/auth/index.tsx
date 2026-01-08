import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import AuthLogo from '../../components/AuthLogo';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

type AuthView = 'welcome' | 'login' | 'signup';

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>('welcome');
  const router = useRouter();
  const { login, register, error, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // We rely on simple state switching; Reanimated will handle the mounting/unmounting animations automatically via `entering` and `exiting` props.

  const handleBack = () => {
    if (view !== 'welcome') {
      setView('welcome');
      return true; 
    }
    return false; 
  };
  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [view]);

  useEffect(() => {
    if (error) {
       Alert.alert("Authentication Error", error);
    }
  }, [error]);

  const handleLogin = async () => {
    if(!email || !password) {
        Alert.alert("Missing Fields", "Please enter both email and password.");
        return;
    }
    try {
        await login(email, password);
    } catch(e) {
        console.log("Login failed", e);
    }
  };

  const handleSignup = async () => {
    if(!email || !password || !name || !phone) {
        Alert.alert("Missing Fields", "Please fill in all fields.");
        return;
    }
    try {
        await register(name, phone, email, password);
    } catch(e) {
        console.log("Signup failed", e);
    }
  };

  const InputField = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    isPassword = false,
    delay = 0 
  }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(600).springify()} 
      style={styles.inputContainer}
    >
      <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword ? !showPassword : false}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
             <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderWelcomeContent = () => (
    <Animated.View 
        key="welcome"
        entering={FadeInUp.delay(400).duration(600).springify()} 
        exiting={FadeOutUp.duration(400)}
        style={styles.welcomeContainer}
    >
      <Text style={styles.welcomeTitle}>Welcome to Droply</Text>
      <Text style={styles.welcomeSubtitle}>The fastest way to send and receive packages.</Text>
      
      <View style={styles.buttonContainer}>
        <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => setView('login')}
            >
            <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setView('signup')}
            >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderLoginContent = () => (
    <Animated.View 
        key="login"
        entering={FadeInDown.delay(400).duration(600)} 
        exiting={FadeOutUp.duration(400)}
        style={styles.formSection}
    >
      <Text style={styles.formTitle}>Login</Text>
      <View style={styles.formContainer}>
        <InputField 
            icon="mail-outline" 
            placeholder="Email Address" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
            autoCapitalize="none"
            delay={500}
        />
        
        <InputField 
            icon="lock-closed-outline" 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            isPassword
            delay={600}
        />

        <Animated.View entering={FadeInDown.delay(700).duration(600)}>
            <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(600)}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLogin} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.actionButtonText}>Login</Text>
                )}
            </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900).duration(600)}>
            <TouchableOpacity onPress={() => setView('welcome')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color="#555" />
                <Text style={styles.backButtonText}>Back to Welcome</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderSignupContent = () => (
    <Animated.View 
        key="signup"
        entering={FadeInDown.delay(400).duration(600)} 
        exiting={FadeOutUp.duration(400)}
        style={styles.formSection}
    >
      <Text style={styles.formTitle}>Create Account</Text>
      <View style={styles.formContainer}>
        <InputField 
            icon="person-outline" 
            placeholder="Full Name" 
            value={name} 
            onChangeText={setName} 
            delay={500}
        />

        <InputField 
            icon="mail-outline" 
            placeholder="Email Address" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
            autoCapitalize="none"
            delay={600}
        />

        <InputField 
            icon="call-outline" 
            placeholder="Phone Number" 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad"
            delay={700}
        />
        
        <InputField 
            icon="lock-closed-outline" 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            isPassword
            delay={800}
        />

        <Animated.View entering={FadeInDown.delay(900).duration(600)}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSignup} disabled={isLoading}>
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.actionButtonText}>Sign Up</Text>
            )}
            </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
            <TouchableOpacity onPress={() => setView('welcome')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color="#555" />
                <Text style={styles.backButtonText}>Back to Welcome</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <AuthLogo />
        </View>

        <Animated.View 
            layout={Layout.springify()} 
            style={[
                styles.bottomSection,
                view === 'signup' ? styles.expandedBottom : {}
            ]}
        >
            <View style={styles.indicator} />
            {view === 'welcome' && renderWelcomeContent()}
            {view === 'login' && renderLoginContent()}
            {view === 'signup' && renderSignupContent()}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light gray for content area
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 25,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  expandedBottom: {
    // Optional: add styles if signup needs more specific adjustment
  },
  indicator: {
    width: 50,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7b68ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#7b68ee',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#7b68ee',
    elevation: 0, 
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7b68ee',
  },
  formSection: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: '#eee',
    // Shadow for inputs
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -5,
  },
  forgotPasswordText: {
    color: '#7b68ee',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#7b68ee',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7b68ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 5,
  },
  backButtonText: {
    color: '#555',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
});
