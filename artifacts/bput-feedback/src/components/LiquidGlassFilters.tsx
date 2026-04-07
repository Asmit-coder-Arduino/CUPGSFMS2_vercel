import { useGlassMode } from "@/contexts/GlassModeContext";
import { useEffect, useRef, useCallback } from "react";

const RADIAL_GRADIENT_PNG = "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAew0lEQVR4nO3d1XZsSYwE0PtNzczMzMzMzMz/PLPug2dyyRFSSKlTVS7ng97ap9zdZ6+QlGn7wiWXXPI/q1atwnVh39/AeahLL70U1mWXXSYXe8a+/92OvRaQpope/Msvv9ytK6644lRFXxNB2vd/k2OoBaRQDEP0wl955ZVtFYFaaHpqARHLgmAYxpf4qquugnX11VeXiz2T4UFoFha9FhBSDATCEAG45pprYF177bVysWdEgDw0C0xcC8hQEQoLwkNgX/DrrruuvSJECI4Fs7D4tYBccskpFBkQHoLrr7/+VN1www3ThZ7r4cmCGbHs+//NvuvcAmFJwVB4IDwAN954I62bbrpJLu85HiAFDMKCkmXf/88WkD3AGNMiQmFBeBDsC37zzTe3V4QIobFgPCwrVc4RkBMYLC0QCi8hGIbxBb7llltO1a233jpd6LkMDgLDEgZhYalyXqAcPZARBksLlBQMhILBvtC33XYbrdtvvz0s7+s9PBEalC4oWbxUOXYoRwvEgzGmRQZFhCF68e+44462iiBFaLJYbKqcFyhHByQDA80UEYoIg32R77zzTlh33XVXutizPDwIjYKFtWDnDcrRAIlgsNliTAsVBQIRAbj77rvbKwLkgVGwjKnCZpVjh3LmgaCtlAeDpYWKAoHwINxzzz2n6t577y0Xep4HxwOjYGGp4kE5pq3XmQZiU8NrpRQYKgqEIUJw3333tVeEB6HJYMlAQa3XMaTJmQSCYNjUYDDGNmpMiywKhsG+xPfff/+peuCBB8qFnufBQWAyWMZUse0Xg4LWw2cVypkD4qUGmzFUGCoKhCFC8OCDD7ZXhAehyWDJQEHD/DGkyZkBEsGwqcFgjG3UmBZZFAyDfYkfeuihU/Xwww+XCz3Pg4PAZLCMqWLbLwZFmU/OCpQzAURNDTZjqDBUFAyEh+CRRx5pLw9PBEbBkoFiZ5RjSZODB3LxP6IHg6UGaqUsDJQWEQoEwoPw6KOPwnrsscfSxZ7lwfHAeFhQqiAotvVCSDwoh47kYIFUUgNtpSIYKC0YCpQQHgb7gj/++ONtFeFBYFDCICwoVRQodut1DGlykEBmcLDh24OB0kJJCYbBvsxPPPGEW08++SSt6Gs9OAiMly4sVSIodpg/JiQHB2TEkYVhUwPNGAwGSwuGgoFQXv6nnnqqXAqiCAxLFpQqHhQ7o2TaLgvlUJEcFJBo3lBSA7VTdsZgMFQUDESE4Omnn26rCE8ERsHiQbHDvNd2ZdPkkJAcDJCOlsprp1QYEQoFhH2Zn3nmGVrPPvtsWN7Xe3AiMB6WDBTWds22XPt+Jw8GCMORhWFTAw3fszAiEMrL/9xzz5VLQRSB6YJit14jkiyUQ0WydyAIx0xqoHbKDt8MhopCAYFe7ueff76tIjwRGAWLB8Vuvby2K5Mmh4Zkb0DQpmq2pfLaqSwMBQUDYV/mF154wa0XX3yRVvS1HhwEJsJSgcLarpmW61A2XHsBksVRmTVQOzUDw6JgINSX/6WXXkqXiigCY7FUobC2KzObHDqSvQAZcbBhvDM1xq3UOGMwGBkUHgb0kr/88svTpeBBYFQsDMo4o4xbr640YcP7PtutnQOJcMy0VOiQrxNGhCKC8Morr7RVBEfF0gEFHTbOtFyHhGSnQKK2qgsHSo2xncrA8FAwEPZlfvXVV9167bXXaEVf68FBYBiWDBTbdnlp0oVkX4P7zoDM4si2VCg1xq3UOGOMMFhaeCg8EN7L//rrr8ulImJgPCwoVUYo44wybr28NFFarrOAZCdA7Al5BsdMS4XaqVkYCIUHAr3sb7zxRrkUPAyMxTILxbZd1ZarimQXQ/vmQND1EQVHpaWyGyqUGmM75bVSKgoPA3rB33zzzelS4CAwEZao9bJtF0oTtulSWi4Fya6vpWwK5GSd6x0CduJgs4ZNjSqMCEUE4a233mqrCI6KpQoFpQmaTTqQeIeJW69/NwPCbuVujYOlBmunKjAUFPaFfvvtt9vLQxNhyULx2i4vTbZAsstbwJsBiXBcjM6ZmcPDYTdUKDXQjKHCqIB45513wnr33Xf/r5R/vgImAwXNKCxN0KarigTNJN7drS2H9k2AjHPHeNYRnZB34UCzhk2NCAZDMcJgILwXH9V7771HK/paDw3CgpJlxBJBQWmCZpNuJPbEHZ2RbJEi7UC8jVV0faQTh22pvHYKJYaSFgxFBsD7778fVgZQhCVKFZQoXtvltVwzSKJrKbvabLUCiYbycWNVxcE2VUpLxVJDgZFBkUHwwQcfhJXBU8ESQYnShLVcbMNVRaJstrrnkVYgmaHcnpCrOLzzDdtSjRsqLzXGdiqCgVBEINiL/+GHH8ql4mFgEBYPCmu7bJrYTRdDYqEoSOyJe2ZoPzggytwxDuX2+kgWB9tUeS2VkhoRDJQUEQj20n/00UdyqXAYGJQsHhQ1TVjLpWy4IiT2Wgob2recR1qA2NZKmTvsOleZOZRNlddSKakRwUBJEYFgL/3HH38slwqHgfFSBUFR04S1XNGGS5lJvPVvNI90tVotQGxrpcwddmOlDOTR4Z/FYVsqJTUiGCgpIhDspf/kk0/kUuEwMF6qIChqmqCWCyGxLZcyuHubrWge6Wq1poGg1kqZO+xQPrOtUnEoqRHBYEnhgfBe/E8//TSsDByGxUsVBEVNkwyS7HbLG9qjeaSr1ZoCorRWbO5AQ3knDjtvZFNDgcFQZBB89tlnYWXwRFgiKNk0YXPJLJJoaEfzyBat1hQQpbXKzB2dOOy8YXGoqeGlBUORRfD555/TyuKJsLD2K5MmCImdS2aRVOaRLVqtMhCWHra1ys4dW+GwLVUmNRiMDAoPwVhffPGF/M9WsLBEyaSJbbm6kVTnEbvV6kiRMhCWHpnWSl3nZnHYYdxrqcbUmIURgbj48ndVBKYDypgmXsvFhvcqkmgeUVutjhQpAfEG86i1UuaOrXFEqRHBUFCgl/rLL79sqwhNhMWDEqXJlkiUeURttToG9hIQpbXytlbK3LFrHCg1vMRQUKAX+6uvvpouBQzCEiVKNJtsjUSZRzJbLdRqbQ4kkx5qa+XNHTMzBxrGWUulpkYEQwHx9ddfl0sBk4WipoltudDwXplJMvNI1Gp1p0gayMxg7rVWytyhnHPM4qjAiFCwl/2bb76RSwXDsGShdCFh5yTKPOK1WjMD+2ZAbHoog7m3tYpOyjOtVRbH2FJ5qYFmDAQjAhEB+Pbbb09VBQ3DYqHYGcVLE9tyVZFk5hHbanlbLXVgr6RICkgmPdhgrrRWszjszKHiiFIjA0NFUK0ITBYKSpMsEjaTZJAorVY0sHemiAxETY/sYM5aq0PA4c0YCgr0Yn/33XfTpYBBWLwZ5RCQKK1WZmDvSBEZSCU92GCe3VpFOGxrpeLwWiqWGhEMFcT333+fLhVMFgpKEzaXqEi8aykjkuxWKxrYu1NEAsI2V0p6sMF8i9aqigO1VAzGiIPByGL44YcfaGXRRFBQ6zVCQS3XLJKuVisa2KMUqWy0JCDjqXl3eqDBfBbHeM6RwaGmhgIjCyFbERYVipcmWSTonCSLJDuwV1NEPV0PgYx3rtRzj2x6VFsrdrdqFzhUGOjl/vHHH8ulYImgbI0E3d2qtlrVFFHORZQ7WiEQdOeqIz06B3PbWqFzjiwOJTUYjAyIn376KawMmAhKlCYVJPacpKPViq6hzKRI5o6WBGQczneRHrM4xvRA2yqGQ00NBUYVg1oRFhWKlyYeErvdQtdSKkh2lSLqsO4Cya527bmHmh7eYD4zd2yJQ4WBXu6ff/65XAqWCMrWSLLzSOYaSpQi9nR9duXrAomGc+XUPJMeXa0Vuj5iV7kqDi81GIwsiF9++YVWFkwEhaVJBok9J7HXUjparUqKeKfr1WGdAmHDuZoe46l5JT06544sjkxqZGF4GNSqQlHTpIpkdh6ZSRF0uq6ufL1h3QXCfiAqGs7RqflselRaKzuUs3OODA6UGhEM9qL/+uuvcqlYGBQvTSIk7JzEG9qVVqsrRdDpujesox+oSgNhJ+fqcM7uXG2ZHqy1snPHLA6WGhGKDIgKGAbFS5MqEjSPdLRaSopEd7SUYV09WYdAZtur6M5VZnNV3Vqx1ipa5ao4VBjsBf/tt9/SpWKJoChIohWw0mqpW63qRgvd0epusyiQ6tlHNJxH5x6z6cFaKzZ3dOGIYFRAZMEwKB1IonlEabVmUoTd0fKG9eyZiAyEba+y7RUbzjPnHioOlB5o7ujCwVJDgfH777+XKwsFpUkXEjSPKKfsmVnEu6PlDevZNottsyiQXbRXM+ceXnpkWqtx7pjBEcGYQaFiYVCqSDLzSNRqZVIkuqO1ZZsVAvEOB7PtlTqce+ceM4M5So8uHCw1VBh//PFHuipQvJZrFkmUIiqSzB2taFivbrPYoSEFkj0crLRXaLW7i/RgrVUnji4UGSzdSLxWa8sUiVa+HW0WOzQMgXh3r2baq+hKezScV2YPO5gr6VHB4cHwXvI///xTrgwWBCWLJJMiaGBXZpHssM5+oKraZil3sy7Y9Ijmj8r2KttezaQHOvOwg3nUWm2FIwMiC6YTidJqoYGdnY1kUqTaZmW3Weq69xQQZf7IHA7uur3y0iPTWs3gyMD466+/wqpCqSCptFpKiuyizVIPDTNzCASSWe96N3fV7RVrrzpmDzU91NYqg2MGRRZLBclsq8VSpDKLVNostM1iN3wz614KxJ5/oJ/9UOcP5XBwi/ZqJj22xDGDQsXSjWRfKRK1WdGhoTKHsJ8Rsechp4Ao5x8d691Ke6WudmfSo4IjaqnYC/7333/LVUEyQski6UgRb+VbabO61r2Z85ALbECPzj865w+2veoYzu3mKpMe3ipXSY5ZFBksmSRhh4nZFGHnIpVhXT00nJ1DlPOQcVC/4A3o6P6Vev6hzB8zV0ui9LDtVWd67BNHN5KuFGHnIpU2Cx0aVuYQdVAf72XZQf0UEHtBEQ3ohz5/sPZqJj1mcHgv+j///BNWBsoskkqKqG3WocwhbFBHFxcvsAEdAckO6B3zx2x7ZYfzrvSYwaGgyGDJIulKETasZ9uszjmkOqizi4sX7IAenaBXBvTs/LF1e9WZHhkcMzAiKAqSzhTZqs2qziEzg7p3on4KyOwJujegK+cf+2yvsumxLxwdSJQU2VeblTkP8Qb12RN1CUhmgzUzoHfPH2h7lWmvZlqrDI5///03rCqSSqtVabO8bVbnHNI1qLNNFgWirnizGyx1QPfOP1Qc6vyxdXqoOBQYKpQskq4UieYQFYl3HpId1KubLLbqvaCseJUrJjMbrMzt3ezpuTp/ICDK7OG1Vl0wFChKqxXNIhUgaA6pnqp3AIkG9ejqu131XvBWvAjILjZYW88fs+2Vkh5b4aggyaaI0mZtNYfsapPlARlXvS6QrVe8W2ywZuaPmfYqaq06cTAkrNWqtln7mkOiTdaWq94QSOYMpHvF2zmgR+cf6vyhtlez6fHff/+dqi1ShLVZmTkkex7SscnqWPVmz0LKQCorXgtkyxVvx4CubK9UIFkYGShVICxFugf1rVa96p0stOpNA/GuuaMfs90CiLLiVX/+Y2ZA32V7peCIkGzVZnUM6t7Ph1TuZG0BhB0Wnpymp4BseUjoAamueCMgMwP6bHpkcMwgUdqszKCeBRKlSBVIx2Hh3oF0HBJ2r3i7BvRjB6IM6l2r3s7Dws2AdN7DOiQg6op3l0AqODwk+wSCVr3HAOTksPCggXQcEi4ghw/EO01fQJqAsFu8C8h+gGQ3WQvISpBzBWQlyJpBFpDzNIOsLdbaYq0t1joHWecg6xxkOyDrJH2dpJ/Lk/R1F2vdxVp3sRovK67bvOs277m9zbt+HmT9PMj6eRARyPqJwvUThesnCtfPpK+fSV8/kx7/TPr6rSbrt5qs32pCfqvJ+r1Y6/dird+LVfzFces3K67frLh+s+L63bzrd/Ou380b/27e9dvd1293X7/dnfx29/X3QdbfB1l/H8T5+yDrL0ytvzC1/sJU8Bem1t8oXH+jcP2NQvI3CtdfuV1/5Xb9lVvnr9yuv5O+/k56Jj3O5d9JV271RldOsnMIOw+prHu7UmQrJB1Y2DO7ccymR8d61zv/iOYP5YqJd4vXBTJ75aQyh6ht1tYpErVaWSQeFBWL9/WspYpwKK3VPtKDtVcd84dyxSQE0nWirpyHbNVmVVNEbbUUJFko2fJgVHGg1iqbHlu3V9H5R8cJOgWSOVFX5hB2cTHTZkW3e7Mp0tVqVZFUwXjP6cShtFbZ9Mjc3lXbK3RBUZ0/lBN0CoTNId7Vd+88ZB9tlnIuorZaKpIISoQlW+j5CEYFh9padcweXe2Vev6Brriz+cMFop6HzK57WZuVvbyYuQavtlqzSBiUKhb2LPuZHTjU9PCutc9cTsy0V9kLiur8AYFkzkOybVa0zfIODbtTpAMJO0zMQJkpDwbaVnXi2Co90OGgsr3KtlfR+UcIJLvurbZZ6NCwcvUk88NUUatVRaJAmcWCnsdgzOBgrVXmh6Jmrpagw8Gu9iq6oBgCiX5GvbrN8g4N1WFdTZFoYO9AwlouFcpseTBQS9WJAw3mHemBhnPlcDDbXnkXFCUgu2qzohRRgHS0Wh1IFCgzYNizGIwuHDOtVXW1i9Jj6/ZKBoLWvdU2KzOsd6WIcjYSzSMKkgwUD0ul0PMjGCoOde6YGcwz6aEM5zPtFZs/XCCozcpus9jdLJQiaOWrzCLZVqsLCUsTC4VhyYJhz7CfZb8XC6MDR7a1qswedrVr0wPdvapsr7z2KgQy02Ypw/oWKaK2WmgeUZEoaYKgeFgyhZ7LYKDUyODw5g7WWm2ZHtFw3tleuUC8bVZ0aKgM65UUmW21MkjYTBKliQpFRRN9rQIDpYYyc2RwzLZW1fRAw3n2cJC1VyEQ79AwM6xXUyRzLuK1Wt48oiBR08RCQVgUMBkQFgWDEaWGisPOHZXWSjn3yKRHdjiPDgdlINHdLGVYz6ZIdC5S3WptgSQDhWGpFnp+BGMXOGbTI9pcsfRQh/Po7lUJSPVMJJMi7FxkptWKhnaExFsBV6AwLBk03tfbz1JhKKtchqNz7mDpMZ57qOlROfuYBsKG9a1TJLqjhYCop+wqEiVNPCgISwQmKvQ8+5kIhpoaWRxs7sgCsa3VlumhDOcyEGVYr6aIPRfx7mhlUmRXSDJQGJZqoedHMHaBYzY97JV2e+4xmx7qcJ4CYof1aOVbSRF0R2u21aogQeckI5IsFIZFhRN9rf0sFQbDMZ5zZHB0tVbozlU2PZTVbjScp4CgYb0zRdAPVGVarQ4k6DBRSRMPCsKiolEwIBQMhpoaaJU7g6PaWtk7V53poQznaSDZlS87F/HuaHUM7Fkk6JyEtVwZKAiLByZT6Ln2sxUYXkvFtlUKjs7BnN25YuceHavdEpBqirDTdXtHq7PV6kTipQlrvRAWBqZa6PkIxQgjSo194vBaK3bnajz32CI90kDUFIlO1zMD+8w8UkHCWq4qFA9MhCf6GvQ5WRheS5XB0TF3qIN5dGrelR5pINkUGU/XvYHda7W8A8RZJOxaipImDIrFwsAoaCIMFoRFgWBEqcGuj8ziUA4EvdaKDebjqXl3epSAsI2Wdy7iDexeqxVdQxmBdCKpQlGweGCUQs9jKCowOnGo6YFwoNaKDebquUc2PUpA1BSpDOzqVstrtZSZhF1LidIkAwVhYWCyhZ5rP1uB4aUGuz6izBzV1gptrbKDeWd6lIFkUsQb2FGrxa6h7AJJNk3YjIKwMDDVQs9HKEYYldTYFQ50nQS1Vmww3yI9ykBOUoT9QBUb2KNWix0gboEkarkUKCoWD0210PMjFBGMqKXaGgc6EFRbKzaYZ07NW4GMd7QqAzvaakXzSAYJmknY3S0vTSpQLBYGhiFS/1n7GfZ7qMJAqWEPAWdmDg8Hmjtsa1UZzCvpMQXESxGl1bJbLW8e6ULiDe82TdhsgqBksWTwRF+roEAwvFkDtVTRCXkXDjR32K1V1Fp1pcc0EJYi2VbLm0dmkETXUippghLFw4LAZPAgBAwEQ4ESI5sa0fWRThxo7si0Vl3pMQ3kBAkb2NWtFptHZpGgcxLWcilpwqB4WBAYFQ9DwEAwFAqMKDXGlko555jBgeYOZWvVNZi3AlFbrco8Ep20V5BU0gRBYe2XxYLAKHAiCAiERYFmjAiGkhoVHNFJeXXu2Kq1agWitFrZeURZ/ypJ4s0lUZp4UFiqKGAiOAqECARLiwiGkhp23lCSQ1nnVuaOrVqrViCs1Rq3Wt48gs5HlPWv0m55c0mUJh4UlioKmAiOAiECwdIigqGkhp03lLZKXeey8w42d4xbq87Wqh0IarXUeYQN7RESZSbxWq4oTTwoLFUUMBEcBUIEgqVFBENJDdtSKTNHFocdypW5o7O12gSIbbXUeQQN7R4SdXCPWq4oTTwoDIsCRsHjIVBAMBQRDCU1UEulDuQqDjuUK3NHZ2u1CRDbaqnzSBaJut2KWi6UJhGULBYERsXDEDAQGRQKDJYaqKWa2VYpOJS5o7O12gyIRcLmEYTEbrZmkdiWS0kT1HaNUFCqeFgQmAyg6GvtZyEUKC0sDNROealhW6pOHHZjZXFsPXdsDuRiRfOIHdq7kSgtlwLFw4JSBYFBaFB5Lz4q+xn2e4jSgiUGgqG0VFvhsEP51nPHToCczCPq0M7Wv1UkUcsVtV0KFJYsCpiOUkCMKFQYrJ2KWqoOHHadqw7lW6THpkBGJGxo3woJarm8NKlCUbEwNDOFnh+hqMDwUgO1VFvj2Hoo3ymQEyTj0O5ttjqQKGkyC0XBYsF4cLKFnms/20MxA0NJjU4c3sZqq7ljp0AQknGz5SHJzCRey+WlCWq72IwSYbFgEBoGRy30PPuZ4/cToWAwWDsVnW+MMGZmDoRj643V3oBcrJN5pILEWwFHLZeXJjNQGJYITISHlfccBgKh6IBhUyNqqTKrXBXHVkP53oB0IMm2XNFsgtquqPWKsERgUKkvPyoGIkLhtVKonYpmjUpLdeg4dg7EIhnPSLqRRGmShRJh8cAwODOFno9AeCiyMKLU2ArHeNaxSxx7AaIgYdstBYmSJrNQFCwWjAcnW+i59rM9FF0wsi1VhMNuq/aNY29AxjMS1m5F11JGJF6aRJsuD0oWiwWD0Hh4omLPsp85fj8qCg9GtKHyUiPCYU/IvbZqF0P5QQCpIOlKk1koCIsHBqFREaGX38PAQCAUMzA6U+OQcewVyElZJOgwMYsEpUkViorFA8PgzBR6PgKhoKjCQKkxi8Oec+yjrTooIAwJursVIWFp4rVdCEoGiwomwqMWe2YEQkURwbDtFEuNLI7x+sih4DgYIB6SmTSJ2q4ZKCMWD4xFY4u98Ozlt2U/C4EYUXTAqMwaUUt1iDgOCsjFQtdSKkiUtiuComBRwTA4M4WeH4GIUGRhoHaqA8e+5o2DB3KCBN0CVpCwNLFtVwQlg8UDY9F4eNRCz7OfiUCoKCIYtp1iqZHFse9h/MwAsUhm0iRquxAUdNg4QkFYPDAIjYKIvfweBgYCoWAwxuGbwUDtVEdLdWg4DhbILBKl7UJQ0NYLYUHJYsFYNAjOTNln288evy8LgqUFGr49GKidOiYcBw1khOIhybZdDAraenlYonRhaBgepdiz7Gd6KcFQoK2UCiNKjbMyb5xJICdIsmmC2i4GBQ3zChYGxqJBcDrKfgZKiBFEhAIN3wwGaqeOJTXOHBAFidd2ZaFksHhgLBqGJ1PoefYzEQgVRRaG106ddRxnCogK5QRJBIUN8xUsFoxFg+B0lP0M+z2M318GBRu+IxjHkhpnGghD4rVdWSgZLCMYiwbBQXgyhZ5nP3P8fsbvU0GRheG1U2cdx5kF4kE5QRJBYVuvChYLxqJBcDrKfob9HsbvL4OCbaUiGMeSGkcDZESSmU8iKBksIxiLBsFBeDKFnmc/c/x+xu9TQZGF4bVTZx3HUQCxUE6QRFDGGQW1XwoWBsaiQXA6yn6G/R4sCBXF2EaxGQPBOJbUOEogKhQ2zKNUUbAwMAwOA6QUe5b9TARCRYHSImqljhHG0QKpQEHtl4JlBOOhYXhmCj0fYRhBRChQG3VeYRw9EAUKar9ULCMYD42FYwu96N6Lb8t+FsIwgsigGNuo8wbj3ABBUNh62JtVGBgVDcNTKfTcCAMC4c0WbF17XmCcOyAWSpQqLFlQulgwFo2F01X2M+z3MH5/CARDwdLiPME4t0AYFJQqHpYoYRgcD5FX3nPsZ7KEUFCgtDiPMM49EA/LmCoISwQGwWGAKoWeaz/bA8FQnPe0QLWADHXxhWDJooJBcBCejrKfYb8HFYRFsWD8fy0gpCIsCAyCg/AwRF6xZ9jPst+LBbFQ5GoBEYuBYWgQHAYoU+yZ4+ciDAtErRaQQp28YCMYDw3CM1vo+QjDCGKhyNcC0lQMDcKDKnrhUaHPWRh6awHZQY0vbQSJFXvGvv/djr3+F2d9+VDXTkGdAAAAAElFTkSuQmCC";

const FILTER_CSS = `
.liquid-glass .glass-card::after,
.liquid-glass .glass::after,
.liquid-glass .glass-strong::after,
.liquid-glass .stat-card::after,
.liquid-glass .lg-card::after {
  filter: url(#liquid-glass-card);
  -webkit-filter: url(#liquid-glass-card);
}
.liquid-glass .lg-sidebar::after,
.liquid-glass .lg-mobile-bar::after {
  filter: url(#liquid-glass-sidebar);
  -webkit-filter: url(#liquid-glass-sidebar);
}
.liquid-glass .glass-nav-item.active::after {
  filter: url(#liquid-glass-nav);
  -webkit-filter: url(#liquid-glass-nav);
}
.liquid-glass .btn-gradient-blue::after,
.liquid-glass .btn-gradient-teal::after,
.liquid-glass .btn-gradient-indigo::after,
.liquid-glass .btn-gradient-slate::after,
.liquid-glass .theme-toggle::after,
.liquid-glass .lg-toggle-btn::after,
.liquid-glass .hero-badge::after,
.liquid-glass .icon-circle-blue::after,
.liquid-glass .icon-circle-teal::after,
.liquid-glass .icon-circle-indigo::after,
.liquid-glass .icon-circle-slate::after,
.liquid-glass .accent-line-blue::after,
.liquid-glass .accent-line-teal::after,
.liquid-glass .accent-line-indigo::after,
.liquid-glass .accent-line-slate::after {
  filter: url(#liquid-glass-btn);
  -webkit-filter: url(#liquid-glass-btn);
}
`;

const BASE_FREQ = 0.008;
const SCROLL_FREQ_BOOST = 0.025;
const SCROLL_SCALE_BOOST = 45;
const DECAY_SPEED = 0.04;

export function LiquidGlassFilters() {
  const { isLiquid, settings } = useGlassMode();
  const turbulenceRefs = useRef<(SVGFETurbulenceElement | null)[]>([]);
  const displacementRefs = useRef<(SVGFEDisplacementMapElement | null)[]>([]);
  const baseScales = useRef<number[]>([]);
  const intensityRef = useRef(0);
  const rafRef = useRef(0);
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const seedOffset = useRef(0);

  const lvl = settings.level;

  const animate = useCallback(() => {
    const intensity = intensityRef.current;
    if (intensity > 0.001) {
      intensityRef.current *= (1 - DECAY_SPEED);
      seedOffset.current += intensity * 2;

      const freqX = BASE_FREQ + SCROLL_FREQ_BOOST * intensity;
      const freqY = BASE_FREQ + SCROLL_FREQ_BOOST * intensity * 0.7;
      const freqStr = `${freqX.toFixed(4)} ${freqY.toFixed(4)}`;

      turbulenceRefs.current.forEach((el) => {
        if (el) {
          el.setAttribute("baseFrequency", freqStr);
          const currentSeed = parseInt(el.getAttribute("seed") || "42");
          el.setAttribute("seed", String(currentSeed + Math.floor(seedOffset.current) % 100));
        }
      });

      displacementRefs.current.forEach((el, i) => {
        if (el) {
          const base = baseScales.current[i] || 77;
          el.setAttribute("scale", String(Math.round(base + SCROLL_SCALE_BOOST * intensity)));
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    } else {
      intensityRef.current = 0;
      const restFreq = `${BASE_FREQ} ${BASE_FREQ}`;
      turbulenceRefs.current.forEach((el) => {
        if (el) el.setAttribute("baseFrequency", restFreq);
      });
      displacementRefs.current.forEach((el, i) => {
        if (el) {
          const base = baseScales.current[i] || 77;
          el.setAttribute("scale", String(base));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!isLiquid) return;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY.current);
      lastScrollY.current = currentY;

      scrollVelocity.current = delta;
      const boost = Math.min(delta / 80, 1);
      intensityRef.current = Math.min(intensityRef.current + boost * 0.3, 1);

      if (!rafRef.current || intensityRef.current > 0.001) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const scrollTarget = document.querySelector("main") || window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isLiquid, animate]);

  if (!isLiquid) return null;

  const cardScale = 77 * lvl;
  const sidebarScale = 90 * lvl;
  const navScale = 40 * lvl;

  baseScales.current = [cardScale, sidebarScale, navScale];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FILTER_CSS }} />
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <filter id="liquid-glass-card" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence ref={(el) => { turbulenceRefs.current[0] = el; }} type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="42" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap ref={(el) => { displacementRefs.current[0] = el; }} in="SourceGraphic" in2="blur" scale={cardScale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-sidebar" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence ref={(el) => { turbulenceRefs.current[1] = el; }} type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap ref={(el) => { displacementRefs.current[1] = el; }} in="SourceGraphic" in2="blur" scale={sidebarScale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-btn" primitiveUnits="objectBoundingBox">
            <feImage xlinkHref={`data:image/png;base64,${RADIAL_GRADIENT_PNG}`} result="map" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="blur" in2="map" scale={lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-nav" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence ref={(el) => { turbulenceRefs.current[2] = el; }} type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="33" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap ref={(el) => { displacementRefs.current[2] = el; }} in="SourceGraphic" in2="blur" scale={navScale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
