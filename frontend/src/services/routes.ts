export const appRoutes = {
  home: '/',
  search: '/buscar',
  seatSelection: (tripId: string) => `/viagens/${tripId}/assentos`,
  checkout: '/checkout',
  reservationLookup: '/reservas',
  reservationSuccess: (code: string) => `/reservas/sucesso/${code}`,
};
