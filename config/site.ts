export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "BuscoCredito",
	description: "Encuentra el préstamo perfecto para ti - Marketplace líder en soluciones financieras",
	navItems: [
		{
			label: "Inicio",
			href: "/",
		},
    {
      label: "Préstamos",
      href: "/prestamos",
    },
    {
      label: "Cómo Funciona",
      href: "/como-funciona",
    },
    {
      label: "Acerca de",
      href: "/acerca-de",
    },
    {
      label: "Transparencia",
      href: "/transparencia",
    }
	],
	navMenuItems: [
		{
			label: "Mi Perfil",
			href: "/perfil",
		},
		{
			label: "Panel de Control",
			href: "/panel",
		},
		{
			label: "Mis Solicitudes",
			href: "/solicitudes",
		},
		{
			label: "Configuración",
			href: "/configuracion",
		},
		{
			label: "Ayuda",
			href: "/ayuda",
		},
		{
			label: "Cerrar Sesión",
			href: "/logout",
		},
	],
	links: {
		github: "https://github.com/buscocredito",
		twitter: "https://twitter.com/buscocredito",
		facebook: "https://facebook.com/buscocredito",
		linkedin: "https://linkedin.com/company/buscocredito",
    website: "https://buscocredito.com"
	},
};
