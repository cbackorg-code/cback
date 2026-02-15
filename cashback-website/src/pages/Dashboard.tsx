import { useState } from "react";
import { mockEntries } from "../lib/mockData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Copy, Calendar, User } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEntries = mockEntries.filter((entry) =>
        entry.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.statementName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent w-fit">
                    Cashback Offers
                </h1>
                <p className="text-muted-foreground">
                    Discover the best cashback rates for your transactions.
                </p>
            </div>

            {/* Use Input for search term */}

            <div className="flex w-full max-w-sm items-center space-x-2">
                <input
                    type="text"
                    placeholder="Search offers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl">{entry.merchant}</CardTitle>
                                    <CardDescription className="font-mono text-xs mt-1 truncate max-w-[200px]" title={entry.statementName}>
                                        {entry.statementName}
                                    </CardDescription>
                                </div>
                                <Badge variant={entry.cashbackRate === "0%" ? "destructive" : "success"} className="text-sm px-3 py-1">
                                    {entry.cashbackRate}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="pb-3">
                            <div className="space-y-2.5">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <User className="mr-2 h-3.5 w-3.5" />
                                    <span>{entry.contributor || "Anonymous"}</span>
                                </div>
                                {entry.lastVerified && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-3.5 w-3.5" />
                                        <span>Verified: {entry.lastVerified}</span>
                                    </div>
                                )}
                                {entry.comments && (
                                    <div className="bg-muted/50 p-2 rounded-md text-xs italic text-muted-foreground mt-2 border border-border/50">
                                        "{entry.comments}"
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 flex justify-between gap-2 border-t bg-muted/20 px-6 py-3">
                            <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                                <Copy className="mr-2 h-3.5 w-3.5" /> Copy Name
                            </Button>
                            {/* Placeholder for future specific link interaction */}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
