import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { supabase } from '../lib/supabase';
import type {
  UserProfile,
  SOSType,
  GeoLocation,
  UserRole,
  AlertStatus,
  EmergencyAlert,
  IncidentReport,
  FeedbackEntry,
  CrisisBrainPrediction,
  FeatureVerificationReport,
  UserRoleInfo,
  AuditLogEntry,
  ReportComment,
  StatusHistoryEntry,
  DashboardSummary,
  Variant_closed_open_inProgress,
  LiveDeploymentInfo,
  SOSConfirmation
} from 'declarations/backend';
import { ExternalBlob } from 'declarations/backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['userSession'] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, profile }: { user: string; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(user);
      return actor.updateUserProfile(principal, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRoleInfo[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: string; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(user);
      return actor.updateUserRole(principal, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}

export function useSetAccountStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, isActive }: { user: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(user);
      return actor.setAccountStatus(principal, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['accountStatus'] });
    },
  });
}

export function useCheckAccountStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['accountStatus', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return true;
      return actor.getAccountStatus(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useGetAuditLogs(limit: number = 50) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLogEntry[]>({
    queryKey: ['auditLogs', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLogs(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

// Enhanced Session Management with automatic recovery and refresh
export function useCreateUserSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createUserSession();
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userSession'], true);
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['accountStatus'] });
      console.log('Session created:', data);
    },
    onError: (error: any) => {
      console.error('Session creation error:', error);
      queryClient.setQueryData(['userSession'], false);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 3000),
  });
}

export function useRefreshUserSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.refreshUserSession();
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userSession'], true);
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      console.log('Session refreshed:', data);
    },
    onError: (error: any) => {
      console.error('Session refresh error:', error);
      queryClient.setQueryData(['userSession'], false);
    },
    retry: 1,
    retryDelay: 1000,
  });
}

// Non-blocking session validation with timeout protection
export function useValidateStoredSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');

      // Create timeout promise
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Session validation timeout')), 5000);
      });

      // Race between validation and timeout
      const validationPromise = actor.validateStoredSession();

      try {
        const result = await Promise.race([validationPromise, timeoutPromise]);
        return result;
      } catch (error) {
        console.error('[Session] Validation failed or timed out:', error);
        return false;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useInvalidateUserSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.invalidateUserSession();
    },
    onSuccess: () => {
      queryClient.setQueryData(['userSession'], false);
      queryClient.invalidateQueries({ queryKey: ['userSession'] });
    },
  });
}

// Admin Session Recovery
export function useRecoverAdminSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.recoverAdminSession();
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userSession'], true);
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      console.log('Admin session recovered:', data);
    },
    onError: (error: any) => {
      console.error('Admin session recovery error:', error);
    },
  });
}

// Add Admin Access - Fixed to properly convert Principal
export function useAddAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipalText: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipalText);
      return actor.addAdminAccess(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    },
    onError: (error: any) => {
      console.error('Add admin access error:', error);
      throw error;
    },
  });
}

// Live Deployment Info
export function useGetLiveDeploymentInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LiveDeploymentInfo | null>({
    queryKey: ['liveDeploymentInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLiveDeploymentInfo();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateLiveDeploymentInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, version, status }: { url: string; version: string; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLiveDeploymentInfo(url, version, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveDeploymentInfo'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}

export function useTriggerAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sosType, location, extraData }: { sosType: SOSType; location: GeoLocation; extraData: string | null }) => {
      // Map frontend SOSType to string for DB
      const typeString = Object.keys(sosType)[0];

      // Insert into Supabase
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: 'anonymous', // Replace with real user ID from Auth later
          type: typeString,
          status: 'active',
          latitude: location.latitude,
          longitude: location.longitude,
          extra_data: extraData
        })
        .select()
        .single();

      if (error) throw error;

      // Construct confirmation object to match backend type
      return {
        alertId: BigInt(data.id),
        timestamp: BigInt(Date.now()) * 1000000n,
        location: location,
        estimatedResponseTime: 5n, // Mock value
        confirmationMessage: "Alert received. Dispatching security team."
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['historicalAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (error) => {
      console.error('Error triggering alert:', error);
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useResolveAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resolveAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['historicalAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (error) => {
      console.error('Error resolving alert:', error);
    },
  });
}

export function useGetActiveAlerts() {
  // Removed useActor since we are using Supabase
  // const { actor, isFetching: actorFetching } = useActor(); 

  return useQuery<AlertStatus[]>({
    queryKey: ['activeAlerts'],
    queryFn: async () => {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Map Supabase rows to the frontend AlertStatus type expected by components
      return (data || []).map((row: any) => ({
        status: { 'active': null }, // Motoko Variant
        updatedAt: BigInt(new Date(row.updated_at).getTime()) * 1000000n, // Nano seconds
        alertId: BigInt(row.id)
      }));
    },
    // No actor dependency needed
    refetchInterval: 3000,
  });
}

export function useReportIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ description, location, media }: { description: string; location: GeoLocation; media: ExternalBlob[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportIncident(description, location, media, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['userIncidentReports'] });
      queryClient.invalidateQueries({ queryKey: ['historicalReports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (error) => {
      console.error('Error reporting incident:', error);
      throw error;
    },
  });
}

export function useGetLatestIncidents(limit: number = 10) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncidentReport[]>({
    queryKey: ['latestIncidents', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLatestIncidents(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserIncidentReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncidentReport[]>({
    queryKey: ['userIncidentReports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserIncidentReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateIncidentReportStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: bigint; status: Variant_closed_open_inProgress }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateIncidentReportStatus(reportId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestIncidents'] });
      queryClient.invalidateQueries({ queryKey: ['userIncidentReports'] });
      queryClient.invalidateQueries({ queryKey: ['historicalReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportComments'] });
      queryClient.invalidateQueries({ queryKey: ['reportStatusHistory'] });
    },
  });
}

export function useAddReportComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, comment }: { reportId: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReportComment(reportId, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reportComments', variables.reportId.toString()] });
    },
  });
}

export function useGetReportComments(reportId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ReportComment[]>({
    queryKey: ['reportComments', reportId?.toString()],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return actor.getReportComments(reportId);
    },
    enabled: !!actor && !actorFetching && reportId !== null,
  });
}

export function useGetReportStatusHistory(reportId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StatusHistoryEntry[]>({
    queryKey: ['reportStatusHistory', reportId?.toString()],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return actor.getReportStatusHistory(reportId);
    },
    enabled: !!actor && !actorFetching && reportId !== null,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, rating }: { message: string; rating: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitFeedback(message, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allFeedback'] });
    },
  });
}

export function useGetAllFeedback() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeedbackEntry[]>({
    queryKey: ['allFeedback'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeedback();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetHistoricalAlerts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EmergencyAlert[]>({
    queryKey: ['historicalAlerts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistoricalAlerts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetHistoricalReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncidentReport[]>({
    queryKey: ['historicalReports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistoricalReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCrisisBrainPrediction() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CrisisBrainPrediction>({
    queryKey: ['crisisBrainPrediction'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCrisisBrainPrediction();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFeatureVerificationReport() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeatureVerificationReport>({
    queryKey: ['featureVerificationReport'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateFeatureVerificationReport();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetDashboardSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}
