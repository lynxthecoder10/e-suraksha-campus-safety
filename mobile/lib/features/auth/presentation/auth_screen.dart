import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:e_suraksha_mobile/core/theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isLoading = false;
  bool _isSignUp = false;

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final name = _nameController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      _showError('Please enter email and password');
      return;
    }

    if (_isSignUp && name.isEmpty) {
      _showError('Please enter your name');
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (_isSignUp) {
        await SupabaseConfig.client.auth.signUp(
          email: email,
          password: password,
          data: {'full_name': name},
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Account created! Please sign in.'),
              behavior: SnackBarBehavior.floating,
            ),
          );
          setState(() => _isSignUp = false);
        }
      } else {
        await SupabaseConfig.client.auth.signInWithPassword(
          email: email,
          password: password,
        );
      }
    } on AuthException catch (error) {
      _showError(error.message);
    } catch (error) {
      _showError('Unexpected error occurred');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Theme.of(context).colorScheme.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
                colors: [
                  Color(0xFF4F46E5),
                  Color(0xFF7C3AED),
                  Color(0xFFC026D3),
                ],
              ),
            ),
          ),
          // Decorative Circles
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.1),
              ),
            ),
          ),
          
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Glassmorphism Logo Container
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.3)),
                      ),
                      child: const Icon(
                        Icons.shield,
                        size: 64,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'E-SURAKSHA',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.black,
                        color: Colors.white,
                        letterSpacing: 4,
                      ),
                    ),
                    const Text(
                      'Campus Safety Redefined',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 48),
                    
                    // Main Form Container
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            _isSignUp ? 'Create Account' : 'Welcome Back',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _isSignUp 
                              ? 'Join the community for a safer campus' 
                              : 'Protect yourself and others today',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.blueGrey,
                            ),
                          ),
                          const SizedBox(height: 32),
                          
                          if (_isSignUp) ...[
                            TextFormField(
                              controller: _nameController,
                              decoration: const InputDecoration(
                                labelText: 'Full Name',
                                prefixIcon: Icon(Icons.person_outline),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          TextFormField(
                            controller: _emailController,
                            decoration: const InputDecoration(
                              labelText: 'Email Address',
                              prefixIcon: Icon(Icons.alternate_email),
                            ),
                            keyboardType: TextInputType.emailAddress,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _passwordController,
                            decoration: const InputDecoration(
                              labelText: 'Password',
                              prefixIcon: Icon(Icons.lock_outline),
                            ),
                            obscureText: true,
                          ),
                          const SizedBox(height: 32),
                          
                          ElevatedButton(
                            onPressed: _isLoading ? null : _submit,
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : Text(_isSignUp ? 'REGISTER' : 'SIGN IN'),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    TextButton(
                      onPressed: () => setState(() => _isSignUp = !_isSignUp),
                      child: Text(
                        _isSignUp 
                          ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' 
                          : 'NEW HERE? CREATE AN ACCOUNT',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: Divider(color: Colors.white.withOpacity(0.3))),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text('OR', style: TextStyle(color: Colors.white.withOpacity(0.7), fontWeight: FontWeight.bold)),
                        ),
                        Expanded(child: Divider(color: Colors.white.withOpacity(0.3))),
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _isLoading ? null : () async {
                          // ... implementation same as before but styled
                          setState(() => _isLoading = true);
                          try {
                            final googleSignIn = GoogleSignIn(
                              serverClientId: SupabaseConfig.googleWebClientId,
                              scopes: const ['email', 'profile'],
                            );
                            final googleUser = await googleSignIn.signIn();
                            if (googleUser == null) {
                               setState(() => _isLoading = false);
                               return; 
                            }
                            final googleAuth = await googleUser.authentication;
                            await SupabaseConfig.client.auth.signInWithIdToken(
                              provider: OAuthProvider.google,
                              idToken: googleAuth.idToken!,
                              accessToken: googleAuth.accessToken!,
                            );
                          } catch (error) {
                            _showError('Google Sign-In Failed');
                          } finally {
                            if (mounted) setState(() => _isLoading = false);
                          }
                        },
                        icon: const Icon(Icons.login, color: Colors.white),
                        label: const Text('CONTINUE WITH GOOGLE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.white, width: 2),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
  }
}
