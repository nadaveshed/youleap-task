# Decisions

## Key decisions

I kept the structure simple and stayed close to the starter project. The products page is rendered on the server, while the filters, Quick View, cart, and checkout are client components because they need local interaction and state.

All product requests go through `src/lib/api.ts`. Search and filters are stored in the URL, so the page can be refreshed or shared without losing the current selection. I also added basic pagination because the API returns 12 products by default, while the supplied data contains more than one page.

For the cart, I used React Context with `useReducer`. The cart is small and only has a few actions, so adding a separate state-management library felt unnecessary. Cart items are saved in `localStorage` so they are not lost on refresh.

I used Zod for checkout validation and Lucide for icons. Both fit the existing stack, and I did not add a UI or state-management library.

## Tradeoffs

With more time, I would add automated tests for variant selection, cart behavior, filters, and checkout. I would also validate saved cart data before loading it and check prices and stock with the backend again before placing an order.

The mock API does not provide structured option values for each variant, so the current implementation matches variants by their titles. This works with the supplied data, but with control over the backend I would return option IDs and values directly instead.

For this task, collection and tag options are derived from the product list. In a larger catalog I would expose them through a dedicated API endpoint.

## Verification

I ran the following commands:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

I also ran the project locally and manually checked the product grid, search and filters, pagination, Quick View, variant price and stock changes, adding and removing cart items, quantity updates, checkout validation, and the success message. I checked that both dialogs close from the close button, the backdrop, and the Escape key.

## Surprises

The main surprise was how variants are represented in the mock data. Variants do not include a direct mapping to their option values. Instead, the values are stored in titles such as `500ml - White`. I kept the matching logic in one helper so this assumption is not spread across the components.

The API also includes an artificial delay. I kept loading states in the product page and Quick View so the interface still feels responsive while requests are in progress.
