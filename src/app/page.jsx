"use client";

import Swal from 'sweetalert2';
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [cihazlar, setCihazlar] = useState([]);
  const [form, setForm] = useState({ cihazAdi: "", seriNo: "", zimmetTarihi: new Date(), teslimTarihi: null, zimmetKisi: "" });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [errors, setErrors] = useState({ zimmetKisi: "", teslimTarihi: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTeslimEtDialogOpen, setIsTeslimEtDialogOpen] = useState(false);
  const [isTeslimAlDialogOpen, setIsTeslimAlDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [teslimAlForm, setTeslimAlForm] = useState({
    hasarDurumu: false,
    eksikParca: false,
    notlar: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("cihazlar");
    if (stored) setCihazlar(JSON.parse(stored));

    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cihazlar", JSON.stringify(cihazlar));
  }, [cihazlar]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const newErrors = {};
    if (!form.zimmetKisi.trim()) {
      newErrors.zimmetKisi = "Lütfen zimmetlenen kişiyi giriniz.";
    }
    if (!form.teslimTarihi) {
      newErrors.teslimTarihi = "Lütfen teslim tarihini seçiniz.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({ zimmetKisi: "", teslimTarihi: "" });
    const yeniCihaz = { ...form, id: crypto.randomUUID() };
    setCihazlar([...cihazlar, yeniCihaz]);
    setForm({ cihazAdi: "", seriNo: "", zimmetTarihi: new Date(), teslimTarihi: null, zimmetKisi: "" });
    setIsSubmitted(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu işlemi geri alamazsınız!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        setCihazlar(cihazlar.filter((cihaz) => cihaz.id !== id));
        Swal.fire('Silindi!', 'Kayıt başarıyla silindi.', 'success');
      }
    });
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
    if (!form.zimmetKisi.trim()) {
      return;
    }
    const updatedList = [...cihazlar];
    updatedList[editIndex] = { ...form, id: updatedList[editIndex].id };
    setCihazlar(updatedList);
    setIsEditDialogOpen(false);
    setForm({ cihazAdi: "", seriNo: "", zimmetTarihi: new Date(), teslimTarihi: null, zimmetKisi: "" });
  };

  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 6);

  const chartData = [
    { name: "Toplam", value: cihazlar.length },
    { name: "Teslim Edildi", value: cihazlar.filter((c) => c.teslimTarihi !== null).length },
    { name: "Teslim Bekleyen", value: cihazlar.filter((c) => c.teslimTarihi === null).length },
  ];

  const handleTeslimAl = () => {
    if (!selectedDevice) {
      Swal.fire('Hata', 'Lütfen bir cihaz seçiniz', 'error');
      return;
    }

    const updatedCihazlar = cihazlar.map(cihaz => {
      if (cihaz.id === selectedDevice.id) {
        return {
          ...cihaz,
          teslimDurumu: {
            hasarDurumu: teslimAlForm.hasarDurumu,
            eksikParca: teslimAlForm.eksikParca,
            notlar: teslimAlForm.notlar,
            teslimAlmaTarihi: new Date()
          }
        };
      }
      return cihaz;
    });

    setCihazlar(updatedCihazlar);
    setIsTeslimAlDialogOpen(false);
    setSelectedDevice(null);
    setTeslimAlForm({
      hasarDurumu: false,
      eksikParca: false,
      notlar: ""
    });
    Swal.fire('Başarılı', 'Cihaz başarıyla teslim alındı', 'success');
  };

  const getPersonDevices = (person) => {
    return cihazlar.filter(cihaz => cihaz.zimmetKisi === person && !cihaz.teslimDurumu);
  };

  return (
    <div className="max-w-4xl mx-auto md:p-8 space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cihaz Zimmetleme Uygulaması</h1>
        <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>{darkMode ? "Açık Tema" : "Koyu Tema"}</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          className="flex-1"
          onClick={() => setIsTeslimEtDialogOpen(true)}
        >
          Teslim Et
        </Button>
        <Button
          className="flex-1"
          onClick={() => setIsTeslimAlDialogOpen(true)}
        >
          Teslim Al
        </Button>
      </div>

      <div className="mt-8">
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

      <div className="grid grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader>Toplam Cihaz</CardHeader>
          <CardContent>{cihazlar.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>Teslim Edilen</CardHeader>
          <CardContent>{cihazlar.filter((c) => c.teslimTarihi !== null).length}</CardContent>
        </Card>
        <Card>
          <CardHeader>Teslim Bekleyen</CardHeader>
          <CardContent>{cihazlar.filter((c) => c.teslimTarihi === null).length}</CardContent>
        </Card>
      </div>

      <div className="w-full h-64 mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>


      <Dialog open={isTeslimEtDialogOpen} onOpenChange={setIsTeslimEtDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cihaz Teslim Et</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 ml-1">Cihaz Adı</Label>
              <Input value={form.cihazAdi} onChange={(e) => setForm({ ...form, cihazAdi: e.target.value })} required />
            </div>
            <div>
              <Label className="mb-2 ml-1">Seri No</Label>
              <Input value={form.seriNo} onChange={(e) => setForm({ ...form, seriNo: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-sm md:col-span-1">
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
              <div className="text-sm md:col-span-1">
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
                {errors.teslimTarihi && (
                  <p className="text-sm text-red-500 mt-1">{errors.teslimTarihi}</p>
                )}
              </div>
            </div>
            <div>
              <Label className="mb-2 ml-1">Zimmetlenen Kişi</Label>
              <Select
                value={form.zimmetKisi}
                onValueChange={(value) => {
                  setForm({ ...form, zimmetKisi: value });
                  if (value) setErrors({ ...errors, zimmetKisi: "" });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kişi Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ahmet Yılmaz">Ahmet Yılmaz</SelectItem>
                  <SelectItem value="Mehmet Can">Mehmet Can</SelectItem>
                  <SelectItem value="Zeynep Kaya">Zeynep Kaya</SelectItem>
                </SelectContent>
              </Select>
              {errors.zimmetKisi && (
                <p className="text-sm text-red-500 mt-1">{errors.zimmetKisi}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <Button type="submit" className="w-full">
                Cihazı Kaydet
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTeslimAlDialogOpen} onOpenChange={setIsTeslimAlDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cihaz Teslim Al</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label className="mb-2 ml-1">Kişi Seçin</Label>
              <Select
                value={selectedPerson}
                onValueChange={(value) => {
                  setSelectedPerson(value);
                  setSelectedDevice(null);
                }}
              >
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

            {selectedPerson && (
              <div>
                <Label className="mb-2 ml-1">Cihaz Seçin</Label>
                {getPersonDevices(selectedPerson).length > 0 ? (
                  <Select
                    value={selectedDevice?.id}
                    onValueChange={(value) => {
                      const device = getPersonDevices(selectedPerson).find(d => d.id === value);
                      setSelectedDevice(device);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Cihaz Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPersonDevices(selectedPerson).map(cihaz => (
                        <SelectItem key={cihaz.id} value={cihaz.id}>
                          {cihaz.cihazAdi} - {cihaz.seriNo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    Bu kişiye ait zimmetli cihaz bulunamadı.
                  </div>
                )}
              </div>
            )}

            {selectedDevice && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasarDurumu"
                    checked={teslimAlForm.hasarDurumu}
                    onCheckedChange={(checked) => setTeslimAlForm({ ...teslimAlForm, hasarDurumu: checked })}
                  />
                  <Label htmlFor="hasarDurumu">Cihaz hasar görmüş mü?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eksikParca"
                    checked={teslimAlForm.eksikParca}
                    onCheckedChange={(checked) => setTeslimAlForm({ ...teslimAlForm, eksikParca: checked })}
                  />
                  <Label htmlFor="eksikParca">Eksik parça var mı?</Label>
                </div>
                <div>
                  <Label className="mb-2 ml-1">Notlar</Label>
                  <Input
                    value={teslimAlForm.notlar}
                    onChange={(e) => setTeslimAlForm({ ...teslimAlForm, notlar: e.target.value })}
                    placeholder="Varsa ek notlarınızı giriniz"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleTeslimAl} disabled={!selectedDevice} className="w-full">
              Teslim Al
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="animate-fade-in backdrop-blur-md transition-all duration-300">
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
                    {form.teslimTarihi ? format(form.teslimTarihi, "PPP") : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.teslimTarihi}
                    onSelect={(date) => setForm({ ...form, teslimTarihi: date })}
                    disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
                  />
                </PopoverContent>
              </Popover>
              {isSubmitted && errors.teslimTarihi && (
                <p className="text-sm text-red-500 mt-1">{errors.teslimTarihi}</p>
              )}
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
