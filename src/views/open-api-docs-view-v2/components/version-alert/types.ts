/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

export interface OpenApiV2VersionAlertProps {
	isVersionedUrl: boolean
	currentVersion: { versionId: string; releaseStage?: string }
	latestStableVersion: { versionId: string }
	basePath: string
}
