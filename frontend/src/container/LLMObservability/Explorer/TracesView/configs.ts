import { TelemetryFieldKey } from 'api/v5/v5';
import type { TableColumnDef } from 'components/TanStackTableView/types';
import {
	getFieldColumn,
	TracesTableRow,
} from 'container/TracesExplorer/TracesTable/getFieldColumn';
import { DEFAULT_PER_PAGE_OPTIONS } from 'hooks/queryPagination';

export const PER_PAGE_OPTIONS: number[] = [10, ...DEFAULT_PER_PAGE_OPTIONS];

/** Always visible: it is the row's link to the trace. */
export const TRACE_ID_COLUMN_ID = 'trace_id';

/** Every column the AI trace list returns; the query computes the whole set regardless. */
export const traceViewFields: TelemetryFieldKey[] = [
	{ name: 'service.name', fieldContext: 'resource' },
	{ name: 'root_span_name' },
	{ name: 'trace_duration_nano' },
	{ name: 'span_count' },
	{ name: 'llm_call_count' },
	{ name: 'total_tokens' },
	{ name: 'estimated_total_cost' },
	{ name: TRACE_ID_COLUMN_ID },
	{ name: 'last_activity_time' },
	{ name: 'start_time' },
	{ name: 'end_time' },
	{ name: 'max_llm_duration_nano' },
	{ name: 'tool_call_count' },
	{ name: 'distinct_tool_count' },
	{ name: 'input_tokens' },
	{ name: 'output_tokens' },
	{ name: 'error_count' },
	{ name: 'input' },
	{ name: 'output' },
] as TelemetryFieldKey[];

/** Off until picked in the fields selector: long text, or narrower interest. */
const HIDDEN_BY_DEFAULT = new Set([
	'last_activity_time',
	'start_time',
	'end_time',
	'max_llm_duration_nano',
	'tool_call_count',
	'distinct_tool_count',
	'input_tokens',
	'output_tokens',
	'error_count',
	'input',
	'output',
]);

export const columns: TableColumnDef<TracesTableRow>[] = traceViewFields.map(
	(field) => ({
		...getFieldColumn(field),
		defaultVisibility: !HIDDEN_BY_DEFAULT.has(field.name),
		enableRemove: field.name !== TRACE_ID_COLUMN_ID,
		canBeHidden: field.name !== TRACE_ID_COLUMN_ID,
	}),
);
