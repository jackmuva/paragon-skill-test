"use client";

import { useState, useEffect, useCallback } from "react";
import { useParagon } from "../hooks/useParagon";

interface SyncPipeline {
	id: string;
	integration: string;
	pipeline: string;
	status: "INITIALIZING" | "ACTIVE" | "IDLE" | "DISABLED" | "ERRORED";
	configurationName: string;
	dateCreated: string;
	dateUpdated: string;
}

interface SyncConfig {
	integration: string;
	name: string;
	icon: string;
	brandColor: string;
	pipelines: { id: string; name: string }[];
}

interface SyncRecord {
	id: string;
	[key: string]: unknown;
}

interface RecordsResponse {
	data: SyncRecord[];
	paging?: {
		totalRecords: number;
		totalActiveRecords: number;
		remainingRecords: number;
		cursor?: string;
	};
}

// Only include HubSpot, Notion, and Confluence
const SYNC_INTEGRATIONS: SyncConfig[] = [
	{
		integration: "hubspot",
		name: "HubSpot",
		icon: "https://cdn.useparagon.com/latest/dashboard/public/integrations/hubspot.svg",
		brandColor: "#F67600",
		pipelines: [
			{ id: "contacts", name: "Contacts" },
			{ id: "companies", name: "Companies" },
			{ id: "deals", name: "Deals" },
		],
	},
	{
		integration: "notion",
		name: "Notion",
		icon: "https://cdn.useparagon.com/latest/dashboard/public/integrations/notion.svg",
		brandColor: "#000000",
		pipelines: [
			{ id: "files", name: "files" },
		],
	},
	{
		integration: "confluence",
		name: "Confluence",
		icon: "https://cdn.useparagon.com/latest/dashboard/public/integrations/confluence.svg",
		brandColor: "#0052CC",
		pipelines: [
			{ id: "files", name: "files" },
		],
	},
];

function RecordsModal({
	isOpen,
	onClose,
	sync,
	config,
}: {
	isOpen: boolean;
	onClose: () => void;
	sync: SyncPipeline;
	config: SyncConfig;
}) {
	const [records, setRecords] = useState<SyncRecord[]>([]);
	const [paging, setPaging] = useState<RecordsResponse["paging"]>();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedRecord, setSelectedRecord] = useState<SyncRecord | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "json">("table");

	useEffect(() => {
		if (isOpen) {
			fetchRecords();
		}
	}, [isOpen]);

	const fetchRecords = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/sync/${sync.id}/records`);
			const data: RecordsResponse = await response.json();

			if (!response.ok) {
				throw new Error((data as unknown as { error: string }).error || "Failed to fetch records");
			}

			setRecords(data.data || []);
			setPaging(data.paging);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch records");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	// Get all unique keys from records for table columns
	const allKeys = Array.from(
		new Set(records.flatMap((record) => Object.keys(record)))
	).filter((key) => key !== "id");

	// Prioritize common fields
	const priorityFields = ["name", "title", "email", "firstName", "lastName", "createdAt", "updatedAt"];
	const sortedKeys = [
		"id",
		...priorityFields.filter((f) => allKeys.includes(f)),
		...allKeys.filter((f) => !priorityFields.includes(f)),
	];

	const displayKeys = sortedKeys.slice(0, 6); // Show first 6 columns in table

	const formatCellValue = (value: unknown): string => {
		if (value === null || value === undefined) return "-";
		if (typeof value === "object") return JSON.stringify(value);
		if (typeof value === "boolean") return value ? "Yes" : "No";
		return String(value);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
					<div className="flex items-center gap-3">
						<img src={config.icon} alt={config.name} className="h-8 w-8" />
						<div>
							<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
								{config.name} - {sync.pipeline}
							</h2>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								{paging?.totalRecords ?? records.length} records synced
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
							<button
								onClick={() => setViewMode("table")}
								className={`px-3 py-1.5 text-xs font-medium ${viewMode === "table"
									? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
									: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
									} rounded-l-md`}
							>
								Table
							</button>
							<button
								onClick={() => setViewMode("json")}
								className={`px-3 py-1.5 text-xs font-medium ${viewMode === "json"
									? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
									: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
									} rounded-r-md`}
							>
								JSON
							</button>
						</div>
						<button
							onClick={fetchRecords}
							disabled={isLoading}
							className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
							title="Refresh"
						>
							<svg className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
						<button
							onClick={onClose}
							className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden">
					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<div className="text-zinc-500">Loading records...</div>
						</div>
					) : error ? (
						<div className="flex h-64 items-center justify-center">
							<div className="text-red-500">{error}</div>
						</div>
					) : records.length === 0 ? (
						<div className="flex h-64 items-center justify-center">
							<div className="text-zinc-500">No records found</div>
						</div>
					) : viewMode === "table" ? (
						<div className="flex h-full">
							{/* Table View */}
							<div className={`flex-1 overflow-auto ${selectedRecord ? "border-r border-zinc-200 dark:border-zinc-800" : ""}`}>
								<table className="w-full">
									<thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
										<tr>
											{displayKeys.map((key) => (
												<th
													key={key}
													className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400"
												>
													{key}
												</th>
											))}
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
										{records.map((record, index) => (
											<tr
												key={record.id || index}
												className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${selectedRecord?.id === record.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
													}`}
											>
												{displayKeys.map((key) => (
													<td
														key={key}
														className="max-w-[200px] truncate px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
														title={formatCellValue(record[key])}
													>
														{formatCellValue(record[key])}
													</td>
												))}
												<td className="px-4 py-3">
													<button
														onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
														className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
													>
														{selectedRecord?.id === record.id ? "Hide" : "View"}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Record Detail Panel */}
							{selectedRecord && (
								<div className="w-96 overflow-auto bg-zinc-50 p-4 dark:bg-zinc-800/50">
									<div className="mb-4 flex items-center justify-between">
										<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Record Details</h3>
										<button
											onClick={() => setSelectedRecord(null)}
											className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
										>
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
									<div className="space-y-3">
										{Object.entries(selectedRecord).map(([key, value]) => (
											<div key={key}>
												<div className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
													{key}
												</div>
												<div className="mt-1 break-all rounded bg-white p-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
													{typeof value === "object" ? (
														<pre className="overflow-auto text-xs">{JSON.stringify(value, null, 2)}</pre>
													) : (
														formatCellValue(value)
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					) : (
						/* JSON View */
						<div className="h-full overflow-auto p-4">
							<pre className="text-xs text-zinc-800 dark:text-zinc-200">
								{JSON.stringify(records, null, 2)}
							</pre>
						</div>
					)}
				</div>

				{/* Footer */}
				{paging && (
					<div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
						<div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
							<span>
								Showing {records.length} of {paging.totalRecords} records
							</span>
							{paging.remainingRecords > 0 && (
								<span>{paging.remainingRecords} more records available</span>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: SyncPipeline["status"] }) {
	const statusConfig = {
		INITIALIZING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Initializing" },
		ACTIVE: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Syncing" },
		IDLE: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Synced" },
		DISABLED: { color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400", label: "Disabled" },
		ERRORED: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Error" },
	};

	const config = statusConfig[status] || statusConfig.ERRORED;

	return (
		<span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
			{config.label}
		</span>
	);
}

function ActiveSyncCard({
	sync,
	config,
	onDisable,
	onReenable,
	onDelete,
}: {
	sync: SyncPipeline;
	config: SyncConfig;
	onDisable: (syncId: string) => void;
	onReenable: (syncId: string) => void;
	onDelete: (syncId: string) => void;
}) {
	const [showRecordsModal, setShowRecordsModal] = useState(false);

	return (
		<>
			<div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<img src={config.icon} alt={config.name} className="h-8 w-8" />
						<div>
							<h4 className="font-medium text-zinc-900 dark:text-zinc-100">
								{config.name} - {sync.pipeline}
							</h4>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Created: {new Date(sync.dateCreated).toLocaleDateString()}
							</p>
						</div>
					</div>
					<StatusBadge status={sync.status} />
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{(sync.status === "IDLE" || sync.status === "ACTIVE") && (
						<button
							onClick={() => setShowRecordsModal(true)}
							className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
						>
							View Records
						</button>
					)}
					{sync.status !== "DISABLED" ? (
						<button
							onClick={() => onDisable(sync.id)}
							className="rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
						>
							Disable
						</button>
					) : (
						<button
							onClick={() => onReenable(sync.id)}
							className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
						>
							Re-enable
						</button>
					)}
					<button
						onClick={() => onDelete(sync.id)}
						className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
					>
						Delete
					</button>
				</div>
			</div>

			<RecordsModal
				isOpen={showRecordsModal}
				onClose={() => setShowRecordsModal(false)}
				sync={sync}
				config={config}
			/>
		</>
	);
}

function IntegrationSyncCard({
	config,
	activeSyncs,
	onEnableSync,
	onDisable,
	onReenable,
	onDelete,
}: {
	config: SyncConfig;
	activeSyncs: SyncPipeline[];
	onEnableSync: (integration: string, pipeline: string) => void;
	onDisable: (syncId: string) => void;
	onReenable: (syncId: string) => void;
	onDelete: (syncId: string) => void;
}) {
	const [isExpanded, setIsExpanded] = useState(activeSyncs.length > 0);
	const [enablingPipeline, setEnablingPipeline] = useState<string | null>(null);

	const handleEnableSync = async (pipeline: string) => {
		setEnablingPipeline(pipeline);
		await onEnableSync(config.integration, pipeline);
		setEnablingPipeline(null);
	};

	const activePipelines = new Set(activeSyncs.map((s) => s.pipeline));

	return (
		<div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex w-full items-center justify-between p-4"
			>
				<div className="flex items-center gap-4">
					<img src={config.icon} alt={config.name} className="h-10 w-10" />
					<div className="text-left">
						<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
							{config.name}
						</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							{activeSyncs.length} active sync{activeSyncs.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
				<svg
					className={`h-5 w-5 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isExpanded && (
				<div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
					<h4 className="mb-3 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
						Available Pipelines
					</h4>
					<div className="mb-4 flex flex-wrap gap-2">
						{config.pipelines.map((pipeline) => {
							const isActive = activePipelines.has(pipeline.id);
							const isEnabling = enablingPipeline === pipeline.id;

							return (
								<button
									key={pipeline.id}
									onClick={() => !isActive && handleEnableSync(pipeline.id)}
									disabled={isActive || isEnabling}
									className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
										? "cursor-not-allowed bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
										: isEnabling
											? "cursor-wait bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
											: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
										}`}
									style={!isActive && !isEnabling ? { borderLeft: `3px solid ${config.brandColor}` } : undefined}
								>
									{isEnabling ? "Enabling..." : isActive ? `${pipeline.name} (Active)` : `Enable ${pipeline.name}`}
								</button>
							);
						})}
					</div>

					{activeSyncs.length > 0 && (
						<>
							<h4 className="mb-3 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
								Active Syncs
							</h4>
							<div className="space-y-3">
								{activeSyncs.map((sync) => (
									<ActiveSyncCard
										key={sync.id}
										sync={sync}
										config={config}
										onDisable={onDisable}
										onReenable={onReenable}
										onDelete={onDelete}
									/>
								))}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}

export function SyncCatalog() {
	const { user, isLoading: isParagonLoading, error: paragonError } = useParagon();
	const [syncs, setSyncs] = useState<SyncPipeline[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Get connected integrations from user
	const connectedIntegrations = new Set(
		Object.entries(user?.integrations ?? {})
			.filter(([, integration]) => integration?.enabled)
			.map(([type]) => type)
	);

	const fetchSyncs = useCallback(async () => {
		try {
			const response = await fetch("/api/sync");
			if (!response.ok) {
				throw new Error("Failed to fetch syncs");
			}
			const data = await response.json();
			setSyncs(data.data || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load syncs");
		} finally {
			setIsLoading(false);
		}
	}, []);

	console.log("syncs:", syncs);

	useEffect(() => {
		fetchSyncs();
	}, [fetchSyncs]);

	const handleEnableSync = async (integration: string, pipeline: string) => {
		try {
			const response = await fetch("/api/sync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ integration, pipeline }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to enable sync");
			}

			await fetchSyncs();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to enable sync");
		}
	};

	const handleDisable = async (syncId: string) => {
		try {
			const response = await fetch(`/api/sync/${syncId}/disable`, {
				method: "POST",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to disable sync");
			}

			await fetchSyncs();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to disable sync");
		}
	};

	const handleReenable = async (syncId: string) => {
		try {
			const response = await fetch(`/api/sync/${syncId}/reenable`, {
				method: "POST",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to re-enable sync");
			}

			await fetchSyncs();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to re-enable sync");
		}
	};

	const handleDelete = async (syncId: string) => {
		if (!confirm("Are you sure you want to delete this sync?")) {
			return;
		}

		try {
			const response = await fetch(`/api/sync/${syncId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete sync");
			}

			await fetchSyncs();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete sync");
		}
	};

	if (isLoading || isParagonLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-lg text-zinc-500">Loading syncs...</div>
			</div>
		);
	}

	if (error || paragonError) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-lg text-red-500">Error: {error || paragonError}</div>
			</div>
		);
	}

	// Filter syncs to only include our supported integrations
	const supportedIntegrations = new Set(SYNC_INTEGRATIONS.map((i) => i.integration));
	const filteredSyncs = syncs.filter((s) => supportedIntegrations.has(s.integration));

	// Filter to only show integrations the user has connected
	const connectedSyncIntegrations = SYNC_INTEGRATIONS.filter(
		(config) => connectedIntegrations.has(config.integration)
	);

	if (connectedSyncIntegrations.length === 0) {
		return (
			<div className="w-full">
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
						Managed Sync
					</h2>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Sync data from your connected integrations
					</p>
				</div>
				<div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="text-lg text-zinc-500">No supported integrations connected</div>
					<p className="max-w-md text-center text-sm text-zinc-400">
						Connect HubSpot, Notion, or Confluence from the{" "}
						<a href="/" className="text-blue-500 underline">
							Integrations tab
						</a>{" "}
						to enable data syncing.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
					Managed Sync
				</h2>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Sync data from your connected integrations
				</p>
			</div>

			<div className="space-y-4">
				{connectedSyncIntegrations.map((config) => {
					const activeSyncs = filteredSyncs.filter(
						(s) => s.integration === config.integration
					);

					return (
						<IntegrationSyncCard
							key={config.integration}
							config={config}
							activeSyncs={activeSyncs}
							onEnableSync={handleEnableSync}
							onDisable={handleDisable}
							onReenable={handleReenable}
							onDelete={handleDelete}
						/>
					);
				})}
			</div>
		</div>
	);
}
