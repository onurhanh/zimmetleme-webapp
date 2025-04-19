"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { format, addMonths, isBefore, isAfter, startOfDay } from "date-fns";

export default function Home() {
  const [cihazlar, setCihazlar] = useState([]);
  const [form, setForm] = useState({ cihazAdi: "", seriNo: "", zimmetTarihi: new Date(), teslimTarihi: null, zimmetKisi: "" });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cihazlar");
    if (stored) setCihazlar(JSON.parse(stored));

    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark"){
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cihazlar", JSON.stringify(cihazlar));
  }, [cihazlar]);

  useEffect(() => {
    if(darkMode){
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const yeniCihaz = { ...form, id: crypto.randomUUID() };
    setCihazlar([...cihazlar, yeniCihaz]);
    setForm({ cihazAdi: "", seriNo: "", zimmetTarihi: new Date(), teslimTarihi: null, zimmetKisi: "" });
  };

  const handleDelete = (id) => {
    setCihazlar(cihazlar.filter((cihaz) => cihaz.id !== id));
  };

  const handleUpdate = (cihaz, index) => {
    setForm({
      cihazAdi: cihaz.cihazAdi,
      seriNo: cihaz.seriNo,
      zimmetTarihi: new Date(cihaz.zimmetTarihi),
      teslimTarihi: cihaz.teslimTarihi ? new Date(cihaz.teslimTarihi) : null,
      zimmetKisi: cihaz.zimmetKisi,
    });
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };

  const handleSaveUpdate = () => {
    const updatedList = [...cihazlar];
    updatedList[editIndex] = { ...form, id: updatedList[editIndex].id };
    setCihazlar(updatedList);
    setIsEditDialogOpen(false);
    setForm({ cihazAdi: "", seriNo: "", zimmetTarihi: new Date(), teslimTarihi: null, zimmetKisi: "" });
  };

  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 6);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Cihaz Zimmetleme Uygulaması</h1>
      <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>{darkMode ? "Açık Tema" : "Koyu Tema"}</Button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 ml-1">Cihaz Adı</Label>
          <Input value={form.cihazAdi} onChange={(e) => setForm({ ...form, cihazAdi: e.target.value })} required />
        </div>
        <div>
          <Label className="mb-2 ml-1">Seri No</Label>
          <Input value={form.seriNo} onChange={(e) => setForm({ ...form, seriNo: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-2">
        <div className="text-sm col-span-1">
          <Label className="mb-2 ml-1">Zimmet Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {form.zimmetTarihi ? format(form.zimmetTarihi, "PPP") : "Tarih Seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.zimmetTarihi}
                onSelect={(date) => {
                  if (date && !isBefore(date, today) && !isAfter(date, maxDate)) {
                    setForm({ ...form, zimmetTarihi: date });
                  }
                }}
                disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-sm col-span-1">
          <Label className="mb-2 ml-1">Teslim Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {form.teslimTarihi ? format(form.teslimTarihi, "PPP") : "Tarih Seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.teslimTarihi}
                onSelect={(date) => {
                  if (date && !isBefore(date, today) && !isAfter(date, maxDate)) {
                    setForm({ ...form, teslimTarihi: date });
                  }
                }}
                disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        </div>
        <div>
          <Label className="mb-2 ml-1">Zimmetlenen Kişi</Label>
          <Select value={form.zimmetKisi} onValueChange={(value) => setForm({ ...form, zimmetKisi: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kişi Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ahmet Yılmaz">Ahmet Yılmaz</SelectItem>
              <SelectItem value="Mehmet Can">Mehmet Can</SelectItem>
              <SelectItem value="Zeynep Kaya">Zeynep Kaya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Button type="submit" className="w-full">
            Cihazı Kaydet
          </Button>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Zimmetli Cihazlar</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cihaz Adı</TableHead>
              <TableHead>Seri No</TableHead>
              <TableHead>Zimmet Tarihi</TableHead>
              <TableHead>Teslim Tarihi</TableHead>
              <TableHead>Kişi</TableHead>
              <TableHead>İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cihazlar.map((cihaz, index) => (
              <TableRow key={cihaz.id}>
                <TableCell>{cihaz.cihazAdi}</TableCell>
                <TableCell>{cihaz.seriNo}</TableCell>
                <TableCell>{new Date(cihaz.zimmetTarihi).toLocaleDateString()}</TableCell>
                <TableCell>{cihaz.teslimTarihi ? new Date(cihaz.teslimTarihi).toLocaleDateString() : "-"}</TableCell>
                <TableCell>{cihaz.zimmetKisi}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" onClick={() => handleUpdate(cihaz, index)}>
                    Güncelle
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(cihaz.id)}>
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="animate-fade-in bg-white/90 backdrop-blur-md transition-all duration-300">
          <DialogHeader>
            <DialogTitle className="mb-2 ml-1">Cihazı Güncelle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label className="mb-2 ml-1">Cihaz Adı</Label>
              <Input value={form.cihazAdi} onChange={(e) => setForm({ ...form, cihazAdi: e.target.value })} />
            </div>
            <div>
              <Label className="mb-2 ml-1">Seri No</Label>
              <Input value={form.seriNo} onChange={(e) => setForm({ ...form, seriNo: e.target.value })} />
            </div>
            <div>
              <Label className="mb-2 ml-1">Zimmet Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {form.zimmetTarihi ? format(form.zimmetTarihi, "PPP") : "Tarih Seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.zimmetTarihi}
                    onSelect={(date) => {
                      if (date && !isBefore(date, today) && !isAfter(date, maxDate)) {
                        setForm({ ...form, zimmetTarihi: date });
                      }
                    }}
                    disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="mb-2 ml-1">Teslim Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {form.teslimTarihi ? format(form.teslimTarihi, "PPP") : "Tarih Seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.teslimTarihi}
                    onSelect={(date) => {
                      if (date && !isBefore(date, today) && !isAfter(date, maxDate)) {
                        setForm({ ...form, teslimTarihi: date });
                      }
                    }}
                    disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="mb-2 ml-1">Zimmetlenen Kişi</Label>
              <Select value={form.zimmetKisi} onValueChange={(value) => setForm({ ...form, zimmetKisi: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kişi Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ahmet Yılmaz">Ahmet Yılmaz</SelectItem>
                  <SelectItem value="Mehmet Can">Mehmet Can</SelectItem>
                  <SelectItem value="Zeynep Kaya">Zeynep Kaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSaveUpdate}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
