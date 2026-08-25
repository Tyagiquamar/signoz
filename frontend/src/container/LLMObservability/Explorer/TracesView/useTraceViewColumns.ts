import { useCallback, useEffect, useMemo } from 'react';
import {
	hideColumn,
	initializeFromDefaults,
	setColumnOrder,
	showColumn,
	useColumnOrder,
	useHiddenColumnIds,
} from 'components/TanStackTableView/useColumnStore';
import { LOCALSTORAGE } from 'constants/localStorage';
import { buildCompositeKey } from 'container/OptionsMenu/utils';
import { TelemetryFieldKey } from 'types/api/v5/queryRange';

import { columns, TRACE_ID_COLUMN_ID, traceViewFields } from './configs';

const STORAGE_KEY = LOCALSTORAGE.AI_OBSERVABILITY_TRACE_VIEW_COLUMNS;

/** Matches the id getFieldColumn derives, so fields and columns address alike. */
const columnIdOf = (field: TelemetryFieldKey): string =>
	buildCompositeKey(field.name, field.fieldContext);

interface UseTraceViewColumns {
	availableFields: TelemetryFieldKey[];
	selectedFields: TelemetryFieldKey[];
	onFieldsChange: (next: TelemetryFieldKey[]) => void;
	requiredFields: readonly string[];
}

/** Edits column visibility in the table's own store; the request is unaffected. */
// TODO(ai-explorer): browser-local only, unlike the list views' `?options=` columns.
export function useTraceViewColumns(): UseTraceViewColumns {
	// The store rejects show/hide until an entry exists; an empty result renders no table.
	useEffect(() => {
		initializeFromDefaults(STORAGE_KEY, columns);
	}, []);

	const hiddenColumnIds = useHiddenColumnIds(STORAGE_KEY);
	const columnOrder = useColumnOrder(STORAGE_KEY);

	const selectedFields = useMemo(() => {
		const hidden = new Set(hiddenColumnIds);
		const orderIndex = new Map(columnOrder.map((id, index) => [id, index]));

		return traceViewFields
			.filter((field) => !hidden.has(columnIdOf(field)))
			.sort(
				(a, b) =>
					(orderIndex.get(columnIdOf(a)) ?? Infinity) -
					(orderIndex.get(columnIdOf(b)) ?? Infinity),
			);
	}, [hiddenColumnIds, columnOrder]);

	const onFieldsChange = useCallback((next: TelemetryFieldKey[]): void => {
		const keptIds = new Set(next.map(columnIdOf));

		columns.forEach((column) => {
			if (keptIds.has(column.id) || column.id === TRACE_ID_COLUMN_ID) {
				showColumn(STORAGE_KEY, column.id);
			} else {
				hideColumn(STORAGE_KEY, column.id);
			}
		});

		// Columns missing from the order sort last, so the visible ones suffice.
		setColumnOrder(STORAGE_KEY, next.map(columnIdOf));
	}, []);

	return {
		availableFields: traceViewFields,
		selectedFields,
		onFieldsChange,
		requiredFields: [TRACE_ID_COLUMN_ID],
	};
}
