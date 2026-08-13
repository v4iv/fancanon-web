import { numify } from 'numify'
import { createColumnHelper, renderComponent } from '@tanstack/svelte-table'

import type { DataTableFeatures } from './data-table-features'
import Status from './status.svelte'
import LinkCell from './link-cell.svelte'
import SortableHeader from './sortable-header.svelte'
import DataTableActions from './data-table-actions.svelte'
// This type is used to define the shape of our data.
// You can use a schema here if you want.
export type StoryShape = {
  id: string
  title: string
  completed: boolean
  viewCount: number
  likeCount: number
  chapterCount: number
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, StoryShape>()

export const columns = columnHelper.columns([
  columnHelper.accessor('title', {
    header: ({ column }) =>
      renderComponent(SortableHeader, {
        title: 'Title',
        onclick: column.getToggleSortingHandler(),
      }),
    cell: ({ row }) =>
      renderComponent(LinkCell, { title: row.original.title, href: `/stories/${row.original.id}` }),
  }),
  columnHelper.accessor('chapterCount', {
    header: 'Chapters',
  }),
  columnHelper.accessor('completed', {
    header: 'Status',
    cell: ({ row }) => renderComponent(Status, { completed: row.original.completed }),
  }),
  columnHelper.accessor('viewCount', {
    header: 'Views',
    cell: ({ row }) => numify(row.original.viewCount),
  }),
  columnHelper.accessor('likeCount', {
    header: 'Likes',
    cell: ({ row }) => numify(row.original.likeCount),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id })
    },
  }),
])

export { default as StoryTable, default as Root } from './data-table.svelte'
