import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../features/auth/presentation/auth_screen.dart';
import '../../features/sos/presentation/home_screen.dart';
import '../../features/map/presentation/map_screen.dart';
import '../../features/incidents/presentation/incidents_screen.dart';
import '../../features/incidents/presentation/add_incident_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/contacts/presentation/emergency_contacts_screen.dart';
import '../../features/safety_resources/presentation/safety_guidelines_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/admin/presentation/admin_dashboard_screen.dart';
import '../../features/admin/presentation/admin_incidents_screen.dart';
import '../../features/admin/presentation/admin_incident_detail_screen.dart';
import '../../features/admin/presentation/admin_users_screen.dart';
import 'scaffold_with_navbar.dart';
import '../config/supabase_config.dart';
import 'go_router_refresh_stream.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/home',
  refreshListenable: GoRouterRefreshStream(SupabaseConfig.client.auth.onAuthStateChange),
  redirect: (context, state) {
    final session = SupabaseConfig.client.auth.currentSession;
    final isLoggingIn = state.uri.toString() == '/auth';

    if (session == null && !isLoggingIn) {
      return '/auth';
    }
    if (session != null && isLoggingIn) {
      return '/home';
    }
    return null;
  },
  routes: [
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthScreen(),
    ),
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return ScaffoldWithNavBar(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const HomeScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/map',
              builder: (context, state) => const SafetyMapScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/incidents',
              builder: (context, state) => const IncidentsListScreen(),
              routes: [
                GoRoute(
                  path: 'add',
                  builder: (context, state) => const AddIncidentScreen(),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
              routes: [
                GoRoute(
                  path: 'contacts',
                  builder: (context, state) => const EmergencyContactsScreen(),
                ),
                GoRoute(
                  path: 'safety',
                  builder: (context, state) => const SafetyGuidelinesScreen(),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
    GoRoute(
       path: '/notifications',
       builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboardScreen(),
      routes: [
        GoRoute(
          path: 'incidents',
          builder: (context, state) => const AdminIncidentsScreen(),
          routes: [
            GoRoute(
              path: 'detail',
              builder: (context, state) {
                final report = state.extra as Map<String, dynamic>;
                return AdminIncidentDetailScreen(report: report);
              },
            ),
          ],
        ),
        GoRoute(
          path: 'users',
          builder: (context, state) => const AdminUsersScreen(),
        ),
      ],
    ),
  ],
);
