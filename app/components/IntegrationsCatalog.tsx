"use client";

import { useParagon } from "../hooks/useParagon";
import { IntegrationMetadata } from "@useparagon/connect";

function IntegrationCard({
	integration,
	isConnected,
	onConnect,
}: {
	integration: IntegrationMetadata;
	isConnected: boolean;
	onConnect: () => void;
}) {
	return (
		<div
			className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
			style={{ borderColor: isConnected ? integration.brandColor : undefined }}
		>
			<img
				src={integration.icon}
				alt={`${integration.name} logo`}
				className="h-12 w-12"
			/>
			<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
				{integration.name}
			</h3>
			<button
				onClick={onConnect}
				className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-500"
				style={{
					backgroundColor: isConnected ? "#22c55e" : "",
				}}
			>
				{isConnected ? "Connected" : "Connect"}
			</button>
		</div>
	);
}

export function IntegrationsCatalog() {
	const { user, integrations, isLoading, error, connect } = useParagon();

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-lg text-zinc-500">Loading integrations...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-lg text-red-500">Error: {error}</div>
			</div>
		);
	}

	if (integrations.length === 0) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
				<div className="text-lg text-zinc-500">No integrations enabled</div>
				<p className="text-sm text-zinc-400">
					Enable integrations in your{" "}
					<a
						href="https://dashboard.useparagon.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-500 underline"
					>
						Paragon dashboard
					</a>{" "}
					to see them here.
				</p>
			</div>
		);
	}

	// Get connected integration types from user
	const connectedIntegrations = new Set(
		Object.entries(user?.integrations ?? {})
			.filter(([, integration]) => integration?.enabled)
			.map(([type]) => type)
	);

	return (
		<div className="w-full">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
					Integrations
				</h2>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Connect your favorite apps and services
				</p>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{integrations.map((integration) => (
					<IntegrationCard
						key={integration.type}
						integration={integration}
						isConnected={connectedIntegrations.has(integration.type)}
						onConnect={() => connect(integration.type)}
					/>
				))}
			</div>
		</div>
	);
}
