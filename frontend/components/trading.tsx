import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fakeHoldings = [
  { symbol: "AAA", shares: 100, price: 150.25, value: 15025 },
  { symbol: "BBB", shares: 200, price: 75.5, value: 15100 },
  { symbol: "CCC", shares: 50, price: 200.0, value: 10000 },
  { symbol: "DDD", shares: 75, price: 80.0, value: 6000 },
  { symbol: "EEE", shares: 120, price: 45.75, value: 5490 },
]

const fakeNews = [
  {
    title: "Market Update: Stocks Rally on Economic Data",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Tech Sector Sees Boost from New Product Launches",
    content:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "Global Markets React to Policy Changes",
    content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "Earnings Season: What to Expect",
    content:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
]

export default function BullOrBust() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="flex justify-between items-center p-4 border-b">
                <h1 className="text-2xl font-bold">Bull or Bust</h1>
                <div className="flex items-center gap-2">
                    <span role="img" aria-label="User icon">
                        👤
                    </span>
                    <span>username</span>
                </div>
            </header>
            <main className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-hidden">
                <div className="flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Total Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-3xl font-bold">$100,000</p>
                            <p className="text-sm text-muted-foreground">Profit/Loss: $0</p>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Positions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Shares</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fakeHoldings.map((holding) => (
                                            <TableRow key={holding.symbol}>
                                                <TableCell>{holding.symbol}</TableCell>
                                                <TableCell>{holding.shares}</TableCell>
                                                <TableCell>${holding.price.toFixed(2)}</TableCell>
                                                <TableCell>${holding.value.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col h-1/3">
                        <CardHeader>
                            <CardTitle>News</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            <ScrollArea className="h-full">
                                {fakeNews.map((article, index) => (
                                    <div key={index} className="mb-4">
                                        <h3 className="font-semibold">{article.title}</h3>
                                        <p className="text-sm text-muted-foreground">{article.content}</p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col h-2/3">
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <p className="text-sm text-muted-foreground">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies,
                                    nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl. Sed vitae nisl eget nisl aliquam
                                    ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed
                                    vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl
                                    eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl
                                    aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam
                                    ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed
                                    vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl
                                    eget nisl aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies. Sed vitae nisl eget nisl
                                    aliquam ultricies. Sed vitae nisl eget nisl aliquam ultricies.
                                </p>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}


