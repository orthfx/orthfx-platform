import { useQuery } from "convex/react";
import { api } from "@orthfx/backend/api";
import { Button } from "@orthfx/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@orthfx/ui/components/ui/card";
import { Input } from "@orthfx/ui/components/ui/input";
import { Label } from "@orthfx/ui/components/ui/label";

function App() {
  const pledgePages = useQuery(api.pledge.getPledgePages);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Pledge</h1>
          <p className="text-muted-foreground text-lg">Support your local parish and community campaigns.</p>
        </div>

        {pledgePages === undefined ? (
          <div className="text-center">Loading campaigns...</div>
        ) : pledgePages.length === 0 ? (
          <div className="text-center text-muted-foreground">No active campaigns found.</div>
        ) : (
          pledgePages.map((page) => {
            const fund = page.fund;
            if (!fund) return null;

            const isFixedGoal = fund.financialGoal !== undefined;
            const progressPercent = isFixedGoal 
              ? Math.min(100, (fund.amountRaised / fund.financialGoal!) * 100) 
              : 0;

            return (
              <Card key={page._id} className="w-full shadow-lg border-border">
                <div className="w-full h-48 bg-muted rounded-t-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-2xl font-bold">{page.title}</h2>
                    <p className="text-sm opacity-90">{fund.name}</p>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle>
                    {isFixedGoal 
                      ? `Campaign Goal: $${(fund.financialGoal! / 100).toLocaleString()}` 
                      : "Ongoing Support"}
                  </CardTitle>
                  <CardDescription>
                    {page.storyRichText}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Progress Bar (if applicable) */}
                  {isFixedGoal ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">${(fund.amountRaised / 100).toLocaleString()} raised</span>
                        <span className="text-muted-foreground">{Math.round(progressPercent)}% of ${(fund.financialGoal! / 100).toLocaleString()}</span>
                      </div>
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold">
                      ${(fund.amountRaised / 100).toLocaleString()} raised so far
                    </div>
                  )}

                  {/* Donation Input */}
                  <div className="space-y-3">
                    <Label htmlFor={`amount-${page._id}`} className="text-base font-semibold">Make a Donation</Label>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          id={`amount-${page._id}`} 
                          type="number" 
                          placeholder="100" 
                          className="pl-8 text-lg"
                        />
                      </div>
                      <Button size="lg" className="w-32 text-lg">Donate</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">$25</Button>
                      <Button variant="outline" size="sm" className="flex-1">$50</Button>
                      <Button variant="outline" size="sm" className="flex-1">$100</Button>
                      <Button variant="outline" size="sm" className="flex-1">$250</Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-muted/50 flex justify-between text-sm text-muted-foreground border-t">
                  <span>Secure payments via Stripe</span>
                  <span>100% of funds go to the church</span>
                </CardFooter>
              </Card>
            );
          })
        )}

      </div>
    </div>
  )
}

export default App
