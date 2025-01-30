import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SidebarMenu } from '../ui/sidebar';

export default function NavFooter() {
  return (
    <SidebarMenu>
      <Card className="group-data-[collapsible=icon]:hidden">
        <CardHeader>
          <CardTitle className="truncate">Data de Validade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="truncate">21/01/2026</p>
        </CardContent>
      </Card>
    </SidebarMenu>
  );
}
