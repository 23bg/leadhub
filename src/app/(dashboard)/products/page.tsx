"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/lib/axios";

type Product = {
    id: string;
    name: string;
    code: string;
    market: string;
    active: boolean;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [market, setMarket] = useState("");

    const load = async () => {
        try {
            const res = await api.get("/api/products");
            setProducts(res.data?.data ?? []);
        } catch {
            toast.error("Failed to load products");
        }
    };

    useEffect(() => {
        load();
    }, []);

    const createProduct = async () => {
        try {
            await api.post("/api/products", {
                name,
                code: code.toUpperCase(),
                market,
            });
            setName("");
            setCode("");
            setMarket("");
            await load();
            toast.success("Product created");
        } catch {
            toast.error("Failed to create product");
        }
    };

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Products</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Add Product</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-4">
                    <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
                    <Input placeholder="Market" value={market} onChange={(e) => setMarket(e.target.value)} />
                    <Button onClick={createProduct}>Add</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Market</TableHead>
                                <TableHead>Active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.code}</TableCell>
                                    <TableCell>{product.market}</TableCell>
                                    <TableCell>{product.active ? "Yes" : "No"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
