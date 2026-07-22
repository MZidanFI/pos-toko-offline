import axiosInstance from "./axiosConfig";

export const getDashboardData = async () => {
  const response = await axiosInstance.get("/laporan/dashboard");
  return response.data;
};

export const getLaporanPenjualan = async (startDate = "", endDate = "") => {
  const response = await axiosInstance.get("/laporan/penjualan", {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getProdukTerlaris = async () => {
  const response = await axiosInstance.get("/laporan/produk-terlaris");
  return response.data;
};

export const getLabaRugi = async () => {
  const response = await axiosInstance.get("/laporan/laba-rugi");
  return response.data;
};