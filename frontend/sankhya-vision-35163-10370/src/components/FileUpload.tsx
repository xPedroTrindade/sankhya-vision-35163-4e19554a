import { Upload, FileSpreadsheet, FileText } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-gradient-card shadow-lg">
      <CardContent className="p-12" onClick={handleClick}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 rounded-full bg-gradient-primary">
            <Upload className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isLoading ? "Processando arquivo..." : "Importar Arquivo de Suporte"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Arraste e solte ou clique para selecionar um arquivo Excel (.xlsx) ou CSV (.csv)
            </p>
          </div>
          <div className="flex gap-4 items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>CSV</span>
            </div>
          </div>
          {!isLoading && (
            <Button className="mt-4">
              Selecionar Arquivo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
