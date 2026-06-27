import { z } from "zod";

const idParam = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const email = z.string().email().max(255);
const password = z.string().min(6).max(255);

const paginationFields = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
};

export const adminUpdateSelfSchema = z.object({
  body: z
    .object({
      nama: z.string().min(1).max(255).optional(),
      password: password.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

export const adminListSchema = z.object({
  query: z.object({ ...paginationFields }),
});

export const adminCreateSchema = z.object({
  body: z.object({
    email,
    password,
    nama: z.string().min(1).max(255),
  }),
});

export const adminUpdateSchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      email: email.optional(),
      password: password.optional(),
      nama: z.string().min(1).max(255).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

export const adminLoginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1).max(255),
  }),
});

export const pengajarLoginSchema = z.object({
  body: z.object({
    email: z.string().email().max(100),
    password: z.string().min(1).max(255),
  }),
});

export const pengajarRegisterSchema = z.object({
  body: z.object({
    nid: z.string().min(1).max(50),
    nama_lengkap: z.string().min(1).max(255),
    prodi: z.string().max(200).optional(),
    email: z.string().email().max(100),
    password,
  }),
});

export const pengajarUpdateSelfSchema = z.object({
  body: z
    .object({
      nama_lengkap: z.string().min(1).max(255).optional(),
      prodi: z.string().max(200).optional().nullable(),
      password: password.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

export const pengajarListSchema = z.object({
  query: z.object({
    prodi: z.string().optional(),
    ...paginationFields,
  }),
});

export const pengajarCreateSchema = z.object({
  body: z.object({
    nid: z.string().min(1).max(50),
    nama_lengkap: z.string().min(1).max(255),
    prodi: z.string().max(200).optional(),
    email: z.string().email().max(100),
    password,
  }),
});

export const pengajarUpdateSchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      nid: z.string().min(1).max(50).optional(),
      nama_lengkap: z.string().min(1).max(255).optional(),
      prodi: z.string().max(200).optional().nullable(),
      email: z.string().email().max(100).optional(),
      password: password.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

const siswaCategory = z.enum(["Mahasiswa", "Praktisi", "Peserta Diklat", "Lainnya"]);

export const siswaLoginSchema = z.object({
  body: z.object({
    email: z.string().email().max(200),
    password: z.string().min(1).max(255),
  }),
});

export const siswaUpdateSelfSchema = z.object({
  body: z
    .object({
      nama: z.string().min(1).max(225).optional(),
      prodi: z.string().max(100).optional().nullable(),
      kelas: z.string().max(100).optional().nullable(),
      password: password.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

export const siswaRegisterSchema = z.object({
  body: z.object({
    nama: z.string().min(1).max(225),
    nim: z.string().min(1).max(50),
    prodi: z.string().max(100).optional(),
    category: siswaCategory.optional(),
    kelas: z.string().max(100).optional(),
    email: z.string().email().max(200),
    password,
  }),
});

export const siswaListSchema = z.object({
  query: z.object({
    category: siswaCategory.optional(),
    prodi: z.string().optional(),
    kelas: z.string().optional(),
    ...paginationFields,
  }),
});

export const siswaCreateSchema = z.object({
  body: z.object({
    nama: z.string().min(1).max(225),
    nim: z.string().min(1).max(50),
    prodi: z.string().max(100).optional(),
    category: siswaCategory.optional(),
    kelas: z.string().max(100).optional(),
    email: z.string().email().max(200),
    password,
  }),
});

export const siswaUpdateSchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      nama: z.string().min(1).max(225).optional(),
      nim: z.string().min(1).max(50).optional(),
      prodi: z.string().max(100).optional().nullable(),
      category: siswaCategory.optional(),
      kelas: z.string().max(100).optional().nullable(),
      email: z.string().email().max(200).optional(),
      password: password.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

export const tugasCreateSchema = z.object({
  body: z.object({
    judul: z.string().min(1).max(255),
    deskripsi: z.string().optional(),
  }),
});

export const tugasUpdateSchema = z.object({
  params: idParam.shape.params,
  body: z
    .object({
      judul: z.string().min(1).max(255).optional(),
      deskripsi: z.string().optional().nullable(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Minimal satu field untuk diupdate." }),
});

export const tugasJoinSchema = z.object({
  body: z.object({
    enrol_code: z.string().length(5),
  }),
});

export const tugasSiswaListSchema = z.object({
  query: z.object({
    joined: z.enum(["true", "false"]).optional(),
    submitted: z.enum(["true", "false"]).optional(),
    ...paginationFields,
  }),
});

export const tugasPengajarListSchema = z.object({
  query: z.object({ ...paginationFields }),
});

export const tugasAdminListSchema = z.object({
  query: z.object({ ...paginationFields }),
});

export const pengumpulanSiswaListSchema = z.object({
  query: z.object({ ...paginationFields }),
});

export const pengumpulanPengajarListSchema = z.object({
  query: z.object({
    tugas_id: z.coerce.number().int().positive().optional(),
    ...paginationFields,
  }),
});

export const pengumpulanAdminListSchema = z.object({
  query: z.object({
    tugas_id: z.coerce.number().int().positive().optional(),
    siswa_id: z.coerce.number().int().positive().optional(),
    ...paginationFields,
  }),
});

export const pengumpulanSiswaSubmitSchema = z.object({
  body: z.object({
    tugas_id: z.coerce.number().int().positive(),
  }),
});

export const pengumpulanNilaiSchema = z.object({
  params: idParam.shape.params,
  body: z.object({
    nilai: z.coerce.number().min(0).max(100),
  }),
});

export const idParamSchema = idParam;
