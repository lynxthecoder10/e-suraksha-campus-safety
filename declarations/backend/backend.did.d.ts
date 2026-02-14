import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface UserProfile {
    'username': string,
    'contactNumber': string,
    'email': string,
    'fullName': string,
}
export type UserRole = { 'admin': null } |
{ 'responder': null } |
{ 'user': null };
export interface UserRoleInfo {
    'role': UserRole,
    'principal': Principal,
}
export interface AuditLogEntry {
    'action': string,
    'timestamp': bigint,
    'userId': Principal,
    'details': string,
}
export interface LiveDeploymentInfo {
    'status': string,
    'url': string,
    'version': string,
    'lastUpdated': bigint,
}
export type SOSType = { 'medical': null } |
{ 'fire': null } |
{ 'security': null } |
{ 'other': null };
export interface GeoLocation { 'latitude': number, 'longitude': number }
export interface AlertStatus {
    'status': { 'active': null } | { 'resolved': null },
    'updatedAt': bigint,
    'alertId': bigint,
}
export interface EmergencyAlert {
    'status': { 'active': null } | { 'resolved': null },
    'timestamp': bigint,
    'location': GeoLocation,
    'sosType': SOSType,
    'alertId': bigint,
    'userId': Principal,
}
export interface ExternalBlob {
    'url': string,
    'contentType': string,
    'size': bigint,
    'name': string,
    'blobId': string,
}
export interface IncidentReport {
    'status': { 'closed': null } | { 'open': null } | { 'inProgress': null },
    'media': Array<ExternalBlob>,
    'description': string,
    'timestamp': bigint,
    'reporterId': Principal,
    'reportId': bigint,
    'location': GeoLocation,
}
export interface ReportComment {
    'content': string,
    'timestamp': bigint,
    'authorId': Principal,
    'commentId': bigint,
}
export interface StatusHistoryEntry {
    'status': { 'closed': null } | { 'open': null } | { 'inProgress': null },
    'timestamp': bigint,
    'changedBy': Principal,
}
export interface FeedbackEntry {
    'rating': bigint,
    'timestamp': bigint,
    'message': string,
    'userId': Principal,
}
export interface CrisisBrainPrediction {
    'riskLevel': string,
    'details': string,
    'recommendation': string,
}
export interface FeatureVerificationReport {
    'features': Array<string>,
    'timestamp': bigint,
    'verifier': Principal,
}
export interface DashboardSummary {
    'activeAlerts': bigint,
    'activeResponders': bigint,
    'totalUsers': bigint,
    'systemHealth': { 'optimal': null } | { 'degraded': null } | { 'critical': null },
    'recentIncidents': bigint,
}
export type Variant_closed_open_inProgress = { 'closed': null } | { 'open': null } | { 'inProgress': null };
export interface SOSConfirmation {
    'alertId': bigint,
    'timestamp': bigint,
    'location': GeoLocation,
    'estimatedResponseTime': bigint,
    'confirmationMessage': string,
}

export interface _SERVICE {
    'getCallerUserProfile': ActorMethod<[], [] | [UserProfile]>,
    'saveCallerUserProfile': ActorMethod<[UserProfile], boolean>,
    'updateUserProfile': ActorMethod<[Principal, UserProfile], boolean>,
    'getCallerUserRole': ActorMethod<[], UserRole>,
    'getAllUsers': ActorMethod<[], Array<UserRoleInfo>>,
    'updateUserRole': ActorMethod<[Principal, UserRole], boolean>,
    'setAccountStatus': ActorMethod<[Principal, boolean], boolean>,
    'getAccountStatus': ActorMethod<[Principal], boolean>,
    'getAuditLogs': ActorMethod<[bigint], Array<AuditLogEntry>>,
    'createUserSession': ActorMethod<[], { 'role': string, 'expiresAt': bigint, 'sessionId': string }>,
    'refreshUserSession': ActorMethod<[], { 'role': string, 'expiresAt': bigint, 'sessionId': string }>,
    'validateStoredSession': ActorMethod<[], boolean>,
    'invalidateUserSession': ActorMethod<[], boolean>,
    'recoverAdminSession': ActorMethod<[], { 'role': string, 'expiresAt': bigint, 'sessionId': string }>,
    'addAdminAccess': ActorMethod<[Principal], boolean>,
    'getLiveDeploymentInfo': ActorMethod<[], [] | [LiveDeploymentInfo]>,
    'updateLiveDeploymentInfo': ActorMethod<[string, string, string], boolean>,
    'triggerAlert': ActorMethod<[SOSType, GeoLocation, [] | [string]], bigint>,
    'resolveAlert': ActorMethod<[bigint], boolean>,
    'getActiveAlerts': ActorMethod<[], Array<AlertStatus>>,
    'reportIncident': ActorMethod<[string, GeoLocation, Array<ExternalBlob>, [] | [string]], bigint>,
    'getLatestIncidents': ActorMethod<[bigint], Array<IncidentReport>>,
    'getUserIncidentReports': ActorMethod<[], Array<IncidentReport>>,
    'updateIncidentReportStatus': ActorMethod<[bigint, Variant_closed_open_inProgress], boolean>,
    'addReportComment': ActorMethod<[bigint, string], boolean>,
    'getReportComments': ActorMethod<[bigint], Array<ReportComment>>,
    'getReportStatusHistory': ActorMethod<[bigint], Array<StatusHistoryEntry>>,
    'submitFeedback': ActorMethod<[string, number], boolean>,
    'getAllFeedback': ActorMethod<[], Array<FeedbackEntry>>,
    'getHistoricalAlerts': ActorMethod<[], Array<EmergencyAlert>>,
    'getHistoricalReports': ActorMethod<[], Array<IncidentReport>>,
    'getCrisisBrainPrediction': ActorMethod<[], CrisisBrainPrediction>,
    'generateFeatureVerificationReport': ActorMethod<[], FeatureVerificationReport>,
    'getDashboardSummary': ActorMethod<[], DashboardSummary>,
}
