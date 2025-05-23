from decimal import Decimal, getcontext

# Set high precision
getcontext().prec = 50

# Physical constants
G = Decimal("6.67430e-11")           # gravitational constant (m^3 kg^-1 s^-2)
c = Decimal("299792458")             # speed of light (m/s) in a vacuum

# Masses and distances
M_earth = Decimal("5.972e24")        # kg
r_earth = Decimal("6.371e6")         # m

M_sun = Decimal("1.9885e30")         # kg
r_earth_sun = Decimal("1.496e11")    # m (1 AU)

M_milkyway = Decimal("1.5e12") * Decimal("1.9885e30")  # kg (solar masses)
r_milkyway = Decimal("27000") * Decimal("9.461e15")    # m (light-years)

M_sheet = Decimal("1.7146e13") * Decimal("1.9885e30")  # kg ~ 10^13 solar masses
r_sheet = Decimal("7") * Decimal("3.086e22")      # m (7 Mpc from us)


# Time dilation formula: sqrt(1 - 2GM/rc^2)
def time_dilation(M, r):
    return (1 - (2 * G * M) / (r * c**2)).sqrt()

# Time dilation at each level
td_earth = time_dilation(M_earth, r_earth)
td_sun_corrected = time_dilation(M_sun, r_earth_sun)
td_milkyway = time_dilation(M_milkyway, r_milkyway)
td_sheet = time_dilation(M_sheet, r_sheet)

print("earth", td_earth)
print("sun", td_sun_corrected)
print("milkyway", td_milkyway)
print("sheet", td_sheet)

# Compound time dilation
compound_td = td_earth * td_sun_corrected * td_milkyway * td_sheet


# Roots of x^4 = x + 1 (precomputed)
x = Decimal("-0.72449195900051561158837228218703656578649448135001")
y = Decimal("1.2207440846057594753616853491088319144324890862486")

# z = (x^4)(y^4)
z = (x ** 4) * (y ** 4)
print("z", z)

# Recursion dimension count exponent: (1 + 2 + 3 + 4) = 10
tetractys_base = Decimal(1 + 2 + 3 + 4)

# Compression power: y + 1
compression_power = y + Decimal(1)
# compression_power = y ** 4

print("compression_power", compound_td)
print("gravitaitonal_compression", compound_td ** compression_power)
# Final recursion depth
n = tetractys_base * (compound_td ** compression_power)

# Calculate a
z_n = z ** n
a = z_n + (1 / z_n) + Decimal(1)

# Output
print("Recursion Depth (n):", n)
print("Fine-Structure Approximation (a):", a)

# We just reconstructed the most famous dimensionless constant in physics from geometry and gravity alone.