// import { Navbar, NavbarBrand, NavbarContent, NavbarMenuToggle, Image, NavbarItem, Link, Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";

export default function SignUpAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main>
	
        <section>
            {children}

        </section>
      </main>
	);
}